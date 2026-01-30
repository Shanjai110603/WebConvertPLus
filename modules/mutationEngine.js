/**
 * WebConvert+ Mutation Engine
 * Handles DOM observation, text node discovery, and processing queues.
 */

class MutationEngineService {
    constructor() {
        this.observer = null;
        this.queue = new Set();
        this.isProcessing = false;
        this.converters = []; // List of registered converter functions

        // Bind methods
        this.processQueue = this.processQueue.bind(this);
        this.handleMutations = this.handleMutations.bind(this);
    }

    /**
     * Register a converter module
     * @param {Object} converter - Module with a .process(textNode) method
     */
    registerConverter(converter) {
        if (converter && typeof converter.process === 'function') {
            this.converters.push(converter);
        }
    }

    /**
     * Start observing the DOM
     */
    start() {
        if (this.observer) return;

        Utils.log('MutationEngine started');

        this.observer = new MutationObserver(this.handleMutations);
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Initial scan
        this.scan(document.body);
    }

    /**
     * Stop observing
     */
    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    /**
     * Handle DOM mutations
     */
    handleMutations(mutations) {
        let shouldSchedule = false;

        for (const mutation of mutations) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.scan(node);
                        shouldSchedule = true;
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        this.addToQueue(node);
                        shouldSchedule = true;
                    }
                });
            } else if (mutation.type === 'characterData') {
                this.addToQueue(mutation.target);
                shouldSchedule = true;
            }
        }

        if (shouldSchedule) {
            this.scheduleProcessing();
        }
    }

    /**
     * Scan an element for text nodes
     */
    scan(root) {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    return Utils.shouldSkipNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        while (walker.nextNode()) {
            this.addToQueue(walker.currentNode);
        }
        this.scheduleProcessing();
    }

    /**
     * Add node to processing queue
     */
    addToQueue(node) {
        // Double check validity before adding
        if (!Utils.shouldSkipNode(node)) {
            this.queue.add(node);
        }
    }

    /**
     * Schedule processing using requestIdleCallback or setTimeout
     */
    scheduleProcessing() {
        if (this.isProcessing) return;

        if (window.requestIdleCallback) {
            window.requestIdleCallback(this.processQueue, { timeout: 1000 });
        } else {
            setTimeout(this.processQueue, 200);
        }
    }

    /**
     * Process the queue of text nodes
     */
    processQueue(deadline) {
        this.isProcessing = true;
        const nodes = Array.from(this.queue);
        this.queue.clear();

        Utils.log(`Processing ${nodes.length} nodes`);

        for (const node of nodes) {
            // Check deadline if available
            if (deadline && deadline.timeRemaining() < 1) {
                // Put remaining nodes back in queue
                const remaining = nodes.slice(nodes.indexOf(node));
                remaining.forEach(n => this.queue.add(n));
                this.scheduleProcessing();
                break;
            }

            // Verify node is still valid and connected
            if (!node.isConnected) continue;

            // Run all registered converters
            // We do this sequentially for each node
            this.runConverters(node);
        }

        this.isProcessing = false;
    }

    /**
     * Run all converters on a single node
     */
    runConverters(node) {
        // Store original text if not already stored
        // We use the parent element to store the data attribute
        const parent = node.parentElement;
        if (!parent) return;

        // If we haven't saved the original text yet, save it.
        // Note: A node might be updated multiple times, so we only save the *first* time we see it 
        // or we need a way to track the true original. 
        // For now, let's assume the first pass is the original.
        if (!parent.hasAttribute('data-original-text')) {
            // We only save if we are about to change it. 
            // But we don't know if we will change it yet.
            // Let the converters decide? 
            // Or we can save it here just in case.
            // Let's wait for a converter to actually match something before modifying.
        }

        let currentText = node.nodeValue;
        let modified = false;

        for (const converter of this.converters) {
            const result = converter.process(currentText, node);
            if (result && result !== currentText) {
                currentText = result;
                modified = true;
            }
        }

        if (modified) {
            if (!parent.hasAttribute('data-original-text')) {
                parent.setAttribute('data-original-text', node.nodeValue);
                parent.setAttribute('data-webconverted', 'true');
            }
            node.nodeValue = currentText;

            // Add tooltip or UI indicator if needed (can be done by adding a sibling span, but that messes up DOM structure)
            // For now, just changing text.
            // Ideally, we should wrap the text in a span to show tooltips, but that breaks the "text node" assumption for future passes.
            // We'll stick to text replacement for now, and maybe use the parent for tooltips.
            parent.title = `Original: ${parent.getAttribute('data-original-text')}`;
        }
    }
}

// Export singleton
window.MutationEngine = new MutationEngineService();

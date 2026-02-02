/**
 * Arc-style URL bar for sidebar
 * Shows current URL and allows editing/navigation
 */

var urlParser = require('util/urlParser.js')
var webviews = require('webviews.js')
var searchbar = require('searchbar/searchbar.js')

const arcUrlBar = {
    container: null,
    input: null,

    initialize: function () {
        console.log('[arcUrlBar] initialize called')
        // Get DOM elements when initialize is called (after DOM is ready)
        arcUrlBar.container = document.getElementById('arc-url-bar')
        arcUrlBar.input = document.getElementById('arc-url-input')
        console.log('[arcUrlBar] container:', arcUrlBar.container)
        console.log('[arcUrlBar] input:', arcUrlBar.input)

        if (!arcUrlBar.input || !arcUrlBar.container) {
            console.warn('[arcUrlBar] Arc URL bar elements not found')
            return
        }
        console.log('[arcUrlBar] elements found, setting up listeners')

        // Update URL when tab changes
        tasks.on('tab-selected', function (tabId) {
            arcUrlBar.updateURL(tabId)
        })

        // Update URL when page navigates
        webviews.bindEvent('did-navigate', function (tabId) {
            if (tabId === tabs.getSelected()) {
                arcUrlBar.updateURL(tabId)
            }
        })

        webviews.bindEvent('did-start-navigation', function (tabId) {
            if (tabId === tabs.getSelected()) {
                arcUrlBar.updateURL(tabId)
            }
        })

        // Handle Enter key to navigate
        arcUrlBar.input.addEventListener('keydown', function (e) {
            console.log('[arcUrlBar] keydown event:', e.key)
            if (e.key === 'Enter') {
                console.log('[arcUrlBar] Enter pressed')
                e.preventDefault()
                var url = this.value.trim()
                console.log('[arcUrlBar] raw input:', url)
                if (url) {
                    // Parse the URL (handles protocols, search queries, etc.)
                    var parsedURL = urlParser.parse(url)
                    console.log('[arcUrlBar] parsed URL:', parsedURL)
                    console.log('[arcUrlBar] selected tab:', tabs.getSelected())
                    webviews.update(tabs.getSelected(), parsedURL)
                    console.log('[arcUrlBar] webviews.update called')
                    this.blur()
                }
            } else if (e.key === 'Escape') {
                arcUrlBar.updateURL(tabs.getSelected())
                this.blur()
            }
        })

        // Select all on focus
        arcUrlBar.input.addEventListener('focus', function () {
            this.select()
        })

        // Initial update
        setTimeout(function () {
            arcUrlBar.updateURL(tabs.getSelected())
        }, 100)
    },

    updateURL: function (tabId) {
        if (document.activeElement === arcUrlBar.input) return // Don't update while editing

        var tab = tabs.get(tabId)
        if (tab && tab.url) {
            var displayURL = urlParser.getSourceURL(tab.url)
            if (displayURL === 'min://newtab') {
                arcUrlBar.input.value = ''
                arcUrlBar.input.placeholder = 'Search or enter address'
            } else {
                arcUrlBar.input.value = displayURL
            }
        } else {
            arcUrlBar.input.value = ''
            arcUrlBar.input.placeholder = 'Search or enter address'
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arcUrlBar.initialize)
} else {
    arcUrlBar.initialize()
}

module.exports = arcUrlBar

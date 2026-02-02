/**
 * Arc-style URL bar for sidebar
 * Shows current URL and allows editing/navigation
 */

var tabs = require('tabState.js')
var urlParser = require('util/urlParser.js')
var webviews = require('webviews.js')
var searchbar = require('searchbar/searchbar.js')

const arcUrlBar = {
    container: null,
    input: null,

    initialize: function () {
        // Get DOM elements when initialize is called (after DOM is ready)
        arcUrlBar.container = document.getElementById('arc-url-bar')
        arcUrlBar.input = document.getElementById('arc-url-input')

        if (!arcUrlBar.input || !arcUrlBar.container) {
            console.warn('Arc URL bar elements not found')
            return
        }

        // Update URL when tab changes
        tabs.on('tab-selected', function (tabId) {
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
            if (e.key === 'Enter') {
                e.preventDefault()
                var url = this.value.trim()
                if (url) {
                    // Direct navigation, bypassing searchbar/plugins
                    webviews.update(tabs.getSelected(), url)
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

/**
 * @type { import('vite').UserConfig }
 */
const config = {
    jsx: 'preact',
    alias: {
        react: 'preact/compat',
        'react-dom': 'preact/compat',
    },
    optimizeDeps: {
        allowNodeBuiltins: true,
    },
}

module.exports = config

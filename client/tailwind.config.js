/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#2563eb',
                    50: '#eff6ff',
                    100: '#dbeafe',
                    500: '#2563eb',
                    600: '#1d4ed8',
                    700: '#1e40af',
                },
                secondary: '#4f46e5',
                accent: '#7c3aed',
                dark: '#1e293b',
                light: '#f8fafc',
                gray: '#64748b',
                instagram: {
                    pink: '#E1306C',
                    purple: '#833AB4',
                    orange: '#F56040',
                    yellow: '#FCCC63',
                }
            },
            backgroundColor: {
                main: '#f9fafb',
            },
            boxShadow: {
                'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
                'navbar': '0 2px 15px rgba(0, 0, 0, 0.05)',
            },
            backdropBlur: {
                'navbar': '10px',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}

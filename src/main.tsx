import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// import './index.css';

ReactDOM.createRoot(
    (() => {
        const app = document.createElement('div')

        const viewReportDiv =
            document?.querySelector('#viewbox_report')?.querySelector('.video-data:last-child') ||
            document.querySelector('.s_form_wrapper')
        viewReportDiv && viewReportDiv.appendChild(app)
        // clearInterval(_interval)

        return app
    })()
).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

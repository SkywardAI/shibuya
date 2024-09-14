export default function SettingSection({ title, children }) {
    return (
        <div className="setting-section">
            <div className="title">{title}</div>
            { children }
        </div>
    )
}
import { useState } from 'react';

const SettingsModal = ({ settings, setSettings, onClose }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: parseInt(value) * 60 }));
  };

  const handleCyclesChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSave = () => {
    setSettings(localSettings);
    onClose();
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">⚙️ Settings</h3>

        <div className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Pomodoro (minutes)</span>
            </label>
            <input
              type="number"
              name="pomodoro"
              value={localSettings.pomodoro / 60}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Short Break (minutes)</span>
            </label>
            <input
              type="number"
              name="short_break"
              value={localSettings.short_break / 60}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Long Break (minutes)</span>
            </label>
            <input
              type="number"
              name="long_break"
              value={localSettings.long_break / 60}
              onChange={handleChange}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Pomodoros until long break</span>
            </label>
            <input
              type="number"
              name="longBreakInterval"
              value={localSettings.longBreakInterval}
              onChange={handleCyclesChange}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {/* Buy Me Coffee Section */}
        <div className="divider"></div>
        <div className="text-center py-2">
          <p className="text-sm text-tertiary">
            If this app helps you stay productive, consider supporting me! ☕
          </p>
          <a
            href="https://buymeacoffee.com/dengobey"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-warning btn-sm gap-2"
          >
            ☕ Buy me a coffee
          </a>
        </div>

        <div className="modal-action">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default SettingsModal;
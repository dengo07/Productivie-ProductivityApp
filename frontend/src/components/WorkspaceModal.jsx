import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, FolderOpen, Download, Upload, FileText, AlertCircle 
} from 'lucide-react';

// Workspace Management Modal Component
function WorkspaceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onLoad, 
  onDelete, 
  onExport, 
  onImport, 
  savedWorkspaces, 
  currentWorkspaceName 
}) {
  const [activeTab, setActiveTab] = useState('save');
  const [workspaceName, setWorkspaceName] = useState(currentWorkspaceName || '');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setWorkspaceName(currentWorkspaceName || '');
    }
  }, [isOpen, currentWorkspaceName]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (workspaceName.trim()) {
      onSave(workspaceName.trim());
      onClose();
    }
  };

  const handleLoad = (workspaceId) => {
    onLoad(workspaceId);
    onClose();
  };

  const handleDelete = (workspaceId, workspaceName) => {
    if (confirm(`Are you sure you want to delete "${workspaceName}"?`)) {
      onDelete(workspaceId);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      const importData = await onImport(file);
      // Add imported workspace to saved workspaces
      onSave(importData.name, importData.data);
      onClose();
    } catch (error) {
      alert(`Failed to import workspace: ${error.message}`);
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 p-6 rounded-2xl shadow-2xl max-w-xl w-full mx-4 border border-base-300 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-base-content">Workspace Manager</h2>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-6">
          <button 
            className={`tab ${activeTab === 'save' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('save')}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>
          <button 
            className={`tab ${activeTab === 'load' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('load')}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Load
          </button>
          <button 
            className={`tab ${activeTab === 'export' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('export')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export/Import
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* Save Tab */}
          {activeTab === 'save' && (
            <div className="space-y-4 p-10">
              <div>
                <label className="label">
                  <span className="label-text">Workspace Name</span>
                </label>
                <input 
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name..."
                  className="input input-bordered w-full"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={onClose} className="btn btn-ghost">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="btn btn-primary"
                  disabled={!workspaceName.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Workspace
                </button>
              </div>
              {currentWorkspaceName && (
                <div className="alert alert-info">
                  <AlertCircle className="w-4 h-4" />
                  <span>Current workspace: "{currentWorkspaceName}"</span>
                </div>
              )}
            </div>
          )}

          {/* Load Tab */}
          {activeTab === 'load' && (
            <div className="space-y-4">
              {savedWorkspaces.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-base-content/50" />
                  <p className="text-base-content/60">No saved workspaces yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedWorkspaces.map((workspace) => (
                    <div key={workspace.id} className="card bg-base-200 p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base-content">{workspace.name}</h3>
                          <p className="text-sm text-base-content/60">
                            {workspace.data?.activeComponents?.length || 0} components
                          </p>
                          <p className="text-xs text-base-content/40">
                            Updated: {new Date(workspace.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleLoad(workspace.id)}
                            className="btn btn-sm btn-primary"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => handleDelete(workspace.id, workspace.name)}
                            className="btn btn-sm btn-error"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Export/Import Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Export Current Workspace</h3>
                <p className="text-sm text-base-content/60 mb-4">
                  Download your current workspace as a JSON file
                </p>
                <button onClick={onExport} className="btn btn-primary">
                  <Download className="w-4 h-4 mr-2" />
                  Export to JSON
                </button>
              </div>

              <div className="divider"></div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Import Workspace</h3>
                <p className="text-sm text-base-content/60 mb-4">
                  Upload a previously exported JSON workspace file
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="file-input file-input-bordered w-full"
                  disabled={importing}
                />
                {importing && (
                  <div className="mt-2">
                    <progress className="progress progress-primary w-full"></progress>
                    <p className="text-sm text-center mt-1">Importing...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WorkspaceModal;
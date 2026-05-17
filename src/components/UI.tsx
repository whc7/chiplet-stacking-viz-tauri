import { useChipletStore } from '../store/chipletStore';
import { invoke } from '@tauri-apps/api/core';

export function UI() {
  const {
    chiplets, selectedChipletId, baseChipletId, alignmentResults, showAlignment, tolerance, setTolerance,
    canRestore, restore,
    addChiplet, removeChiplet, selectChiplet, setBaseChiplet, updateChiplet, mirrorChiplet,
    addBump, addTSV, updateBump, updateTSV, stackChiplets, xfoldStack, yfoldStack, checkAlignment, setShowAlignment, clearAll,
  } = useChipletStore();

  const selectedChiplet = chiplets.find((c) => c.id === selectedChipletId);
  const alignedCount = alignmentResults.filter((r) => r.aligned).length;
  const totalChecked = alignmentResults.length;

  const handleSave = async () => {
    try {
      const projectData = { chiplets, version: '1.0.0' };
      const data = JSON.stringify(projectData, null, 2);
      const path = await invoke<string>('save_project', { data });
      alert(`Project saved to ${path}`);
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const handleLoad = async () => {
    try {
      const data = await invoke<string>('load_project');
      const projectData = JSON.parse(data);
      useChipletStore.getState().loadProject(projectData.chiplets);
    } catch (e) {
      console.error('Load failed:', e);
    }
  };

  return (
    <div style={{ width: '320px', background: '#16213e', color: '#e94560', padding: '16px', overflowY: 'auto', borderLeft: '2px solid #0f3460', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 style={{ margin: 0, color: '#e94560', fontSize: '20px' }}>Chiplet Stacker (Tauri)</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={addChiplet} style={buttonStyle('#0f3460')}>+ Add Chiplet</button>
        <button onClick={stackChiplets} style={buttonStyle('#e94560')}>Stack (no flip)</button>
        <button onClick={xfoldStack} style={buttonStyle('#e67e22')}>X-Fold (flip over X)</button>
        <button onClick={yfoldStack} style={buttonStyle('#d35400')}>Y-Fold (rotate 180°)</button>
        <button onClick={checkAlignment} style={buttonStyle('#533483')}>Check Alignment</button>
        <button onClick={restore} disabled={!canRestore} style={{ ...buttonStyle(canRestore ? '#3498db' : '#2c3e50'), opacity: canRestore ? 1 : 0.5 }}>↩ Restore Last Stack/Fold</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSave} style={{ ...buttonStyle('#0f3460'), flex: 1 }}>Save</button>
          <button onClick={handleLoad} style={{ ...buttonStyle('#0f3460'), flex: 1 }}>Load</button>
        </div>
        <button onClick={clearAll} style={buttonStyle('#333')}>Clear All</button>
      </div>

      {alignmentResults.length > 0 && (
        <div style={{ background: '#0f3460', padding: '12px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '14px' }}>Alignment Results</h3>
            <button onClick={() => setShowAlignment(!showAlignment)} style={{ ...buttonStyle(showAlignment ? '#22c55e' : '#333'), padding: '4px 8px', fontSize: '12px' }}>
              {showAlignment ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ fontSize: '13px', marginBottom: '8px' }}>Aligned: {alignedCount} / {totalChecked}</div>
          <div style={{ fontSize: '12px', color: '#aaa', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Tolerance: {tolerance.toFixed(3)}</span>
            <input type="range" min="0.01" max="0.2" step="0.01" value={tolerance} onChange={(e) => setTolerance(parseFloat(e.target.value))} style={{ flex: 1 }} />
          </div>
        </div>
      )}

      <div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Chiplets ({chiplets.length}) {baseChipletId && <span style={{ color: '#fbbf24', fontSize: '12px' }}>Base: {chiplets.find(c => c.id === baseChipletId)?.name}</span>}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {chiplets.map((chiplet) => (
            <div key={chiplet.id} onClick={() => selectChiplet(chiplet.id)} style={{
              padding: '8px 12px', background: selectedChipletId === chiplet.id ? '#e94560' : '#0f3460',
              color: '#fff', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>{chiplet.id === baseChipletId ? '⬡ ' : ''}{chiplet.name}</span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {chiplet.id !== baseChipletId && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setBaseChiplet(chiplet.id); }} 
                    style={{ background: '#fbbf24', border: 'none', color: '#000', cursor: 'pointer', fontSize: '10px', padding: '2px 6px', borderRadius: '3px', fontWeight: 'bold' }}
                  >
                    Set Base
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); removeChiplet(chiplet.id); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>×</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedChiplet && (
        <div style={{ background: '#0f3460', padding: '12px', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>{selectedChiplet.name}</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['position', 'rotation', 'scale'] as const).map((type) => (
              <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: '#aaa' }}>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['X', 'Y', 'Z'].map((axis, i) => (
                    <input
                      key={axis}
                      type="number"
                      step={type === 'rotation' ? '15' : '0.1'}
                      value={type === 'rotation' ? Math.round((selectedChiplet.rotation[i] * 180) / Math.PI) : selectedChiplet[type][i].toFixed(2)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        if (type === 'position') useChipletStore.getState().setChipletPosition(selectedChiplet.id, selectedChiplet.position.map((v, idx) => idx === i ? val : v) as [number, number, number]);
                        else if (type === 'rotation') useChipletStore.getState().setChipletRotation(selectedChiplet.id, selectedChiplet.rotation.map((v, idx) => idx === i ? val * (Math.PI / 180) : v) as [number, number, number]);
                        else useChipletStore.getState().setChipletScale(selectedChiplet.id, selectedChiplet.scale.map((v, idx) => idx === i ? val : v) as [number, number, number]);
                      }}
                      style={{ width: '60px', padding: '6px', background: '#16213e', color: '#fff', border: '1px solid #533483', borderRadius: '4px', fontSize: '12px', textAlign: 'center' }}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => mirrorChiplet(selectedChiplet.id, 'x')} style={{ ...buttonStyle('#533483'), flex: 1 }}>Mirror X</button>
              <button onClick={() => mirrorChiplet(selectedChiplet.id, 'y')} style={{ ...buttonStyle('#533483'), flex: 1 }}>Mirror Y</button>
              <button onClick={() => mirrorChiplet(selectedChiplet.id, 'z')} style={{ ...buttonStyle('#533483'), flex: 1 }}>Mirror Z</button>
            </div>

            <div style={{ marginTop: '8px', borderTop: '1px solid #533483', paddingTop: '8px' }}>
              <label style={{ fontSize: '12px', color: '#aaa' }}>Features</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button onClick={() => addBump(selectedChiplet.id, [0, selectedChiplet.height / 2 + 0.08, 0])} style={{ ...buttonStyle('#e74c3c'), flex: 1 }}>+ Bump</button>
                <button onClick={() => addTSV(selectedChiplet.id, [0, 0])} style={{ ...buttonStyle('#3498db'), flex: 1 }}>+ TSV</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedChiplet.bumps.map((bump) => (
                  <div key={bump.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', background: 'rgba(231,76,60,0.1)', padding: '6px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>● Bump</span>
                      <button onClick={() => useChipletStore.getState().removeBump(selectedChiplet.id, bump.id)} style={{ background: 'transparent', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '14px' }}>×</button>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['X', 'Y', 'Z'].map((axis, i) => (
                        <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: '#888' }}>{axis}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={bump.position[i].toFixed(2)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const newPos = [...bump.position] as [number, number, number];
                              newPos[i] = val;
                              updateBump(selectedChiplet.id, bump.id, newPos);
                            }}
                            style={{ width: '50px', padding: '3px', background: '#16213e', color: '#fff', border: '1px solid #533483', borderRadius: '3px', fontSize: '11px', textAlign: 'center' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {selectedChiplet.tsvs.map((tsv) => (
                  <div key={tsv.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11px', background: 'rgba(52,152,219,0.1)', padding: '6px', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#3498db', fontWeight: 'bold' }}>● TSV</span>
                      <button onClick={() => useChipletStore.getState().removeTSV(selectedChiplet.id, tsv.id)} style={{ background: 'transparent', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '14px' }}>×</button>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['X', 'Z'].map((axis, i) => (
                        <div key={axis} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <span style={{ fontSize: '10px', color: '#888' }}>{axis}</span>
                          <input
                            type="number"
                            step="0.01"
                            value={tsv.position[i].toFixed(2)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              const newPos = [...tsv.position] as [number, number];
                              newPos[i] = val;
                              updateTSV(selectedChiplet.id, tsv.id, newPos);
                            }}
                            style={{ width: '50px', padding: '3px', background: '#16213e', color: '#fff', border: '1px solid #533483', borderRadius: '3px', fontSize: '11px', textAlign: 'center' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '8px', borderTop: '1px solid #533483', paddingTop: '8px' }}>
              <label style={{ fontSize: '12px', color: '#aaa' }}>Appearance</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px' }}>Front</span>
                  <input type="color" value={selectedChiplet.frontColor} onChange={(e) => updateChiplet(selectedChiplet.id, { frontColor: e.target.value })} style={{ width: '30px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '11px' }}>Back</span>
                  <input type="color" value={selectedChiplet.backColor} onChange={(e) => updateChiplet(selectedChiplet.id, { backColor: e.target.value })} style={{ width: '30px', height: '24px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                  <span style={{ fontSize: '11px' }}>Opacity</span>
                  <input type="range" min="0.1" max="1" step="0.1" value={selectedChiplet.opacity} onChange={(e) => updateChiplet(selectedChiplet.id, { opacity: parseFloat(e.target.value) })} style={{ flex: 1 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {chiplets.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>Click "Add Chiplet" to start</div>}
    </div>
  );
}

const buttonStyle = (bg: string) => ({
  background: bg, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px',
  cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
} as React.CSSProperties);

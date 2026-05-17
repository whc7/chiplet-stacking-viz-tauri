use tauri_plugin_dialog::DialogExt;
use std::sync::Arc;

#[tauri::command]
fn save_project(app: tauri::AppHandle, data: String) -> Result<String, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    let tx = Arc::new(std::sync::Mutex::new(tx));
    
    app.dialog()
        .file()
        .add_filter("Chiplet Project", &["chiplet"])
        .save_file(move |file_path| {
            let result = match file_path {
                Some(path) => {
                    let path_str = path.to_string();
                    match std::fs::write(&path_str, data.clone()) {
                        Ok(_) => Ok(path_str),
                        Err(e) => Err(e.to_string()),
                    }
                }
                None => Err("User cancelled".to_string()),
            };
            let _ = tx.lock().unwrap().send(result);
        });
    
    rx.recv().map_err(|e| e.to_string())?
}

#[tauri::command]
fn load_project(app: tauri::AppHandle) -> Result<String, String> {
    let (tx, rx) = std::sync::mpsc::channel();
    let tx = Arc::new(std::sync::Mutex::new(tx));
    
    app.dialog()
        .file()
        .add_filter("Chiplet Project", &["chiplet"])
        .pick_file(move |file_path| {
            let result = match file_path {
                Some(path) => {
                    let path_str = path.to_string();
                    match std::fs::read_to_string(&path_str) {
                        Ok(contents) => Ok(contents),
                        Err(e) => Err(e.to_string()),
                    }
                }
                None => Err("User cancelled".to_string()),
            };
            let _ = tx.lock().unwrap().send(result);
        });
    
    rx.recv().map_err(|e| e.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![save_project, load_project])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

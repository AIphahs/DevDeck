use serde::{Deserialize, Serialize};
use std::process::Stdio;
use tokio::process::Command;

#[derive(Deserialize)]
pub struct CommandRequest {
    pub shell: ShellType,
    pub command: String,
    pub working_dir: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ShellType {
    PowerShell,
    Bash,
    Cmd,
}

#[derive(Serialize)]
pub struct CommandOutput {
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

#[tauri::command]
pub async fn execute_command(req: CommandRequest) -> Result<CommandOutput, String> {
    let (program, args) = match req.shell {
        ShellType::PowerShell => ("powershell", vec!["-Command", &req.command]),
        ShellType::Bash => ("bash", vec!["-c", &req.command]),
        ShellType::Cmd => ("cmd", vec!["/C", &req.command]),
    };

    let mut cmd = Command::new(program);
    cmd.args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    if let Some(dir) = &req.working_dir {
        cmd.current_dir(dir);
    }

    let output = cmd.output().await.map_err(|e| e.to_string())?;

    Ok(CommandOutput {
        stdout: String::from_utf8_lossy(&output.stdout).into_owned(),
        stderr: String::from_utf8_lossy(&output.stderr).into_owned(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}

#[tauri::command]
pub async fn execute_script(
    path: String,
    shell: ShellType,
) -> Result<CommandOutput, String> {
    let command = match shell {
        ShellType::PowerShell => format!("& '{}'", path),
        ShellType::Bash => path.clone(),
        ShellType::Cmd => path.clone(),
    };

    execute_command(CommandRequest {
        shell,
        command,
        working_dir: None,
    })
    .await
}

use std::collections::HashSet;

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Permission {
    ExecuteShell,
    ReadFileSystem,
    WriteFileSystem,
    NetworkAccess,
    AudioCapture,
    SystemMonitor,
    GlobalShortcuts,
    ManageProcesses,
    AccessSecrets,
}

pub struct PermissionSet(HashSet<Permission>);

impl PermissionSet {
    pub fn empty() -> Self {
        Self(HashSet::new())
    }

    pub fn all() -> Self {
        Self(HashSet::from([
            Permission::ExecuteShell,
            Permission::ReadFileSystem,
            Permission::WriteFileSystem,
            Permission::NetworkAccess,
            Permission::AudioCapture,
            Permission::SystemMonitor,
            Permission::GlobalShortcuts,
            Permission::ManageProcesses,
            Permission::AccessSecrets,
        ]))
    }

    pub fn has(&self, perm: &Permission) -> bool {
        self.0.contains(perm)
    }

    pub fn grant(&mut self, perm: Permission) {
        self.0.insert(perm);
    }
}

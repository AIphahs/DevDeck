use sysinfo::{Components, Disks, Networks, System};

pub struct SystemMonitor {
    sys: System,
    disks: Disks,
    networks: Networks,
    components: Components,
}

impl SystemMonitor {
    pub fn new() -> Self {
        Self {
            sys: System::new_all(),
            disks: Disks::new_with_refreshed_list(),
            networks: Networks::new_with_refreshed_list(),
            components: Components::new_with_refreshed_list(),
        }
    }

    pub fn refresh(&mut self) {
        self.sys.refresh_all();
        self.disks.refresh(true);
        self.networks.refresh(true);
        self.components.refresh(true);
    }

    pub fn cpu_usage(&self) -> f32 {
        self.sys.global_cpu_usage()
    }

    pub fn ram_used(&self) -> u64 {
        self.sys.used_memory()
    }

    pub fn ram_total(&self) -> u64 {
        self.sys.total_memory()
    }

    pub fn temperatures(&self) -> Vec<(String, f32)> {
        self.components
            .iter()
            .filter_map(|c| {
                c.temperature().map(|t| (c.label().to_string(), t))
            })
            .collect()
    }
}

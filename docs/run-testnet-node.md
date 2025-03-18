# Running a Hyperliquid Testnet Node

This guide provides step-by-step instructions for setting up and running a Hyperliquid Testnet node.

For detailed information, visit the official repository: https://github.com/hyperliquid-dex/node

## Prerequisites

- Ubuntu Linux server
- Root or sudo access
- Internet connection

## Installation

### 1. System Preparation

Update the system:
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Configure Visor

Create a configuration file:
```bash
echo '{"chain": "Testnet"}' > ~/visor.json
```

### 3. Download the Visor Binary

```bash
curl https://binaries.hyperliquid-testnet.xyz/Testnet/hl-visor > ~/hl-visor && chmod a+x ~/hl-visor
```

### 4. Set Up Systemd Service

Create the service file:
```bash
sudo vi /etc/systemd/system/hl-visor.service
```

Add the following content:
```
[Unit]
Description=HL Visor Service
After=network.target

[Service]
Type=simple
ExecStart=/home/ubuntu/hl-visor run-non-validator
Restart=on-failure
User=ubuntu
WorkingDirectory=/home/ubuntu

[Install]
WantedBy=multi-user.target
```

Or

To create the file efficiently,

```
sudo tee /etc/systemd/system/hl-visor.service > /dev/null <<EOF
[Unit]
Description=HL Visor Service
After=network.target

[Service]
Type=simple
ExecStart=/home/ubuntu/hl-visor run-non-validator
Restart=on-failure
User=ubuntu
WorkingDirectory=/home/ubuntu

[Install]
WantedBy=multi-user.target
EOF
```

### 5. Enable and Start the Service

Reload systemd, enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable hl-visor.service
sudo systemctl start hl-visor.service
```

Check the service status:
```bash
sudo systemctl status hl-visor.service
```


The visor should start like the below:

```
ubuntu@i-10100000686241:~$ journalctl -fu hl-visor.service
Mar 18 21:51:49 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:49.779Z WARN >>> hl-node @@ gossip_server_connect_to_peer connected to abci stream from 116.199.229.58:4001
Mar 18 21:51:49 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:49.790Z WARN >>> hl-node @@ gossip_server_connect_to_peer received abci greeting from 116.199.229.58:4001
Mar 18 21:51:49 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:49.791Z WARN >>> hl-node @@ error connecting to candidate peer Ip(116.199.229.58): Peer full
Mar 18 21:51:49 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:49.795Z WARN >>> hl-node @@ new candidate peers: [Ip(54.249.160.165), Ip(34.86.189.203), Ip(34.85.127.224), Ip(54.249.37.209), Ip(199.254.199.104)]
Mar 18 21:51:54 i-10100000686241 hl-visor[26242]: 2025-03-18T21:51:54.573Z WARN >>> hl-visor @@ /home/ubuntu/hl-visor run-non-validator @@ child status @@ [start_time: Time(2025-03-18T21:51:44.570593020)] @ [n_restarts: 1] @ [err_fln: "/home/ubuntu/hl/data/visor_child_stderr/20250407/224/2025-03-18T21:51:44Z"]
Mar 18 21:51:54 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:54.796Z WARN >>> hl-node @@ connecting to peer: Ip(34.85.127.224)
```

## Operations and Maintenance

### Monitoring Logs

View logs in real-time:
```bash
journalctl -fu hl-visor.service
```

### Useful Systemd Commands

#### Log Viewing Options

**Display recent logs in real-time:**
```bash
journalctl -fu hl-visor.service
```
- `-f`: Display logs in real-time (equivalent to `tail -f`)
- `-u hl-visor.service`: Show logs for a specific service only

**Show last 50 lines of logs:**
```bash
journalctl -u hl-visor.service -n 50
```
- `-n 50`: Display the most recent 50 lines

**Show only error messages:**
```bash
journalctl -u hl-visor.service -p err
```
- `-p err`: Display only ERROR level logs

**Show logs for a specific time period:**
```bash
journalctl -u hl-visor.service --since "1 hour ago"
```
- `--since "1 hour ago"`: Show logs from the last hour
- Example with date range:
  ```bash
  journalctl -u hl-visor.service --since "2024-03-19 10:00:00" --until "2024-03-19 12:00:00"
  ```

#### Service Management

**Start the service:**
```bash
sudo systemctl start hl-visor.service
```

**Stop the service:**
```bash
sudo systemctl stop hl-visor.service
```

**Restart the service:**
```bash
sudo systemctl restart hl-visor.service
```

**Check service status:**
```bash
systemctl status hl-visor.service
```

#### Auto-Start Configuration

**Enable auto-start at boot:**
```bash
sudo systemctl enable hl-visor.service
```

**Disable auto-start at boot:**
```bash
sudo systemctl disable hl-visor.service
```

**Temporarily disable auto-start for next boot only:**
```bash
sudo systemctl mask hl-visor.service
```
Note: When masked, the service cannot be started manually either.

**Unmask a service:**
```bash
sudo systemctl unmask hl-visor.service
```

#### Service Configuration Changes

**Reload systemd after changing configuration files:**
```bash
sudo systemctl daemon-reload
```
Note: Run this after modifying any service configuration files (e.g., `/etc/systemd/system/hl-visor.service`).

**Apply configuration changes:**
```bash
sudo systemctl restart hl-visor.service
```

#### Resource Monitoring

**Check resource usage for a specific service:**
```bash
systemctl show -p MemoryCurrent,CPUUsageNS hl-visor.service
```

**List resource usage for all systemd services:**
```bash
systemctl list-units --type=service --all
```

**Monitor CPU and memory usage by process:**
```bash
htop
```
If htop is not installed, install it with:
```bash
sudo apt install htop  # For Debian/Ubuntu
# or
sudo yum install htop  # For RHEL/CentOS
```

#### Service Dependencies

**List service dependencies:**
```bash
systemctl list-dependencies hl-visor.service
```
This shows other services that this service depends on.

## Troubleshooting

If you encounter issues with your node, the first step should be checking the logs:
```bash
journalctl -fu hl-visor.service
```

For further assistance, refer to the official Hyperliquid documentation or community channels.

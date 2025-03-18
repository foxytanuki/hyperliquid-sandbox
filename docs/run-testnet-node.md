# Running a Hyperliquid Testnet Node

This guide provides step-by-step instructions for setting up and running a Hyperliquid Testnet node.

For detailed information, visit the official repository: https://github.com/hyperliquid-dex/node

## Prerequisites

- Ubuntu Linux server (24.04 LTS only)
- Root or sudo access
- Minimum system requirements:
  - 4+ CPU cores
  - 32+ GB RAM
  - 200+ GB SSD storage

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

Create the service file using one of these methods:

Option 1: Using a text editor:
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

Option 2: Using tee command (more efficient):
```bash
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

Note: If your username is not "ubuntu", replace all instances of "ubuntu" with your actual username.

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

The visor should start with logs similar to this:

```
ubuntu@i-10100000686241:~$ journalctl -fu hl-visor.service
Mar 18 21:51:49 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:49.779Z WARN >>> hl-node @@ gossip_server_connect_to_peer connected to abci stream from 116.199.229.58:4001
Mar 18 21:51:49 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:49.790Z WARN >>> hl-node @@ gossip_server_connect_to_peer received abci greeting from 116.199.229.58:4001
Mar 18 21:51:49 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:49.791Z WARN >>> hl-node @@ error connecting to candidate peer Ip(116.199.229.58): Peer full
Mar 18 21:51:49 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:49.795Z WARN >>> hl-node @@ new candidate peers: [Ip(54.249.160.165), Ip(34.86.189.203), Ip(34.85.127.224), Ip(54.249.37.209), Ip(199.254.199.104)]
Mar 18 21:51:54 i-10100000686241 hl-visor[26242]: 2025-03-18T21:51:54.573Z WARN >>> hl-visor @@ /home/ubuntu/hl-visor run-non-validator @@ child status @@ [start_time: Time(2025-03-18T21:51:44.570593020)] @ [n_restarts: 1] @ [err_fln: "/home/ubuntu/hl/data/visor_child_stderr/20250407/224/2025-03-18T21:51:44Z"]
Mar 18 21:51:54 i-10100000686241 hl-visor[26300]: 2025-03-18T21:51:54.796Z WARN >>> hl-node @@ connecting to peer: Ip(34.85.127.224)
```

## Setting Up RPC Endpoint

If you want to expose an RPC endpoint for your Hyperliquid node, follow these steps to set up Nginx as a reverse proxy with SSL.

### 1. Install Nginx

```bash
sudo apt update && sudo apt install -y nginx
```

### 2. Configure Firewall

Allow necessary ports through the firewall:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 4000:4010/tcp
sudo ufw allow 4000:4010/udp
sudo ufw enable
```

### 3. Configure Nginx as Reverse Proxy

Create a new Nginx configuration file:
```bash
sudo vim /etc/nginx/sites-available/testnet.hl.rpc.example.com
```

Add the following configuration (replace `testnet.hl.rpc.example.com` with your actual domain):
```
server {
    listen 80;
    server_name testnet.hl.rpc.example.com;

    location /evm {
        proxy_pass http://localhost:3001/evm;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    error_log /var/log/nginx/testnet.hl.rpc.error.log;
    access_log /var/log/nginx/testnet.hl.rpc.access.log;
}
```

Create a symbolic link to enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/testnet.hl.rpc.example.com /etc/nginx/sites-enabled/
```

Validate the Nginx configuration:
```bash
sudo nginx -t
```

Apply the changes:
```bash
sudo systemctl restart nginx
```

### 4. Test RPC Endpoint

You can test your RPC endpoint with:
```bash
curl -X POST --header 'Content-Type: application/json' \
    --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["latest",false],"id":1}' \
    http://testnet.hl.rpc.example.com/evm
```

### 5. Secure with SSL (HTTPS)

Install Certbot for SSL certificate management:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

Obtain and install SSL certificate:
```bash
sudo certbot --nginx -d testnet.hl.rpc.example.com
```

Enable automatic certificate renewal:
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
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
sudo apt install htop
```

**Advanced monitoring tools:**
```bash
# Install additional monitoring tools
sudo apt install -y sysstat iotop

# Monitor disk I/O
sudo iotop

# System activity report
sudo sar -u 1 10  # CPU usage, 10 samples with 1-second interval
```

#### Service Dependencies

**List service dependencies:**
```bash
systemctl list-dependencies hl-visor.service
```
This shows other services that this service depends on.

## Data Management

### Backup and Data Persistence

Create a backup of your node configuration:
```bash
# Backup configuration
mkdir -p ~/hl-backups
cp ~/visor.json ~/hl-backups/
```

If you need to backup node data:
```bash
# Stop the service first
sudo systemctl stop hl-visor.service

# Backup data directory
tar -czvf ~/hl-data-backup-$(date +%Y%m%d).tar.gz ~/hl/data

# Restart the service
sudo systemctl start hl-visor.service
```

## Troubleshooting

### Common Issues and Solutions

**Node fails to start:**
1. Check the logs for error messages:
   ```bash
   journalctl -u hl-visor.service -n 100
   ```
2. Verify the visor.json configuration:
   ```bash
   cat ~/visor.json
   ```
3. Ensure the hl-visor binary has execute permissions:
   ```bash
   chmod +x ~/hl-visor
   ```

**Node not syncing:**
1. Check network connectivity:
   ```bash
   curl -I https://binaries.hyperliquid-testnet.xyz
   ```
2. Verify that required ports are open:
   ```bash
   sudo ufw status
   ```

**High resource usage:**
1. Monitor system resources:
   ```bash
   htop
   ```
2. Check disk space:
   ```bash
   df -h
   ```

## Updating Your Node

When updates are available for Hyperliquid testnet nodes:

```bash
# Stop the service
sudo systemctl stop hl-visor.service

# Backup the old binary
mv ~/hl-visor ~/hl-visor.backup

# Download the new binary
curl https://binaries.hyperliquid-testnet.xyz/Testnet/hl-visor > ~/hl-visor && chmod a+x ~/hl-visor

# Start the service
sudo systemctl start hl-visor.service

# Verify the service is running
sudo systemctl status hl-visor.service
```

## Security Recommendations

- Keep your server updated with the latest security patches
- Use SSH key authentication instead of password authentication
- Configure a firewall to only allow necessary connections
- Set up fail2ban to prevent brute force attacks
- Regularly monitor logs for suspicious activity
- Consider using a dedicated user for running the node service


---

#!/bin/bash

#  ./setup-alerts.sh

set -e

echo "=== 设置 DigitalOcean Kubernetes 集群监控告警 ==="

if ! command -v doctl &> /dev/null; then
    echo "错误: 未安装 doctl CLI"
    echo "请访问: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

echo "获取集群信息..."
CLUSTER_ID=$(doctl kubernetes cluster list --format ID --no-header | head -n 1)

if [ -z "$CLUSTER_ID" ]; then
    echo "错误: 未找到 Kubernetes 集群"
    exit 1
fi

echo "集群 ID: $CLUSTER_ID"

echo ""
echo "创建告警策略..."


echo "- 设置 CPU 使用率告警 (>80%)"
doctl monitoring alert create \
    --type "v1/insights/droplet/cpu" \
    --description "High CPU Usage - Cloudproject Cluster" \
    --compare "GreaterThan" \
    --value 80 \
    --window "5m" \
    --entities "$CLUSTER_ID" \
    --enabled true 2>/dev/null || echo "  (可能已存在)"


echo "- 设置内存使用率告警 (>85%)"
doctl monitoring alert create \
    --type "v1/insights/droplet/memory_utilization" \
    --description "High Memory Usage - Cloudproject Cluster" \
    --compare "GreaterThan" \
    --value 85 \
    --window "5m" \
    --entities "$CLUSTER_ID" \
    --enabled true 2>/dev/null || echo "  (可能已存在)"


echo "- 设置磁盘使用率告警 (>90%)"
doctl monitoring alert create \
    --type "v1/insights/droplet/disk_utilization" \
    --description "High Disk Usage - Cloudproject Cluster" \
    --compare "GreaterThan" \
    --value 90 \
    --window "5m" \
    --entities "$CLUSTER_ID" \
    --enabled true 2>/dev/null || echo "  (可能已存在)"


echo "- 设置负载平均值告警"
doctl monitoring alert create \
    --type "v1/insights/droplet/load_5" \
    --description "High Load Average - Cloudproject Cluster" \
    --compare "GreaterThan" \
    --value 2 \
    --window "5m" \
    --entities "$CLUSTER_ID" \
    --enabled true 2>/dev/null || echo "  (可能已存在)"

echo ""
echo "=== 告警配置完成 ==="
echo ""
echo "查看所有告警:"
echo "  doctl monitoring alert list"
echo ""
echo "查看集群指标:"
echo "  DigitalOcean 控制台 → Kubernetes → 你的集群 → Insights"
echo ""
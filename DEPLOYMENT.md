# Deployment Guide - AWS AppRunner & CI/CD

Complete guide for deploying CleanCraft to AWS AppRunner with automated CI/CD pipeline.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [AWS Setup](#aws-setup)
- [Manual Deployment](#manual-deployment)
- [CI/CD Setup](#cicd-setup)
- [Production Configuration](#production-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## 📋 Prerequisites

### Required AWS Resources
- [x] AWS Account with billing enabled
- [x] IAM User with appropriate permissions
- [x] AWS CLI configured locally
- [x] ECR (Elastic Container Registry) repository

### Local Requirements
- [x] Docker & Docker Compose
- [x] AWS CLI v2+
- [x] Node.js 18+
- [x] Git

### Permissions Required (IAM Policy)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "apprunner:*",
        "ecr:*",
        "cloudwatch:*",
        "logs:*",
        "iam:PassRole",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSubnets",
        "ec2:DescribeVpcs"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## ☁️ AWS Setup

### 1. Create ECR Repository

**Via AWS Console:**
```
ECR → Create Repository
Name: cleancraft
Visibility: Private
```

**Via AWS CLI:**
```bash
aws ecr create-repository \
  --repository-name cleancraft \
  --region us-east-1
```

### 2. Configure AWS CLI

```bash
# Configure credentials
aws configure

# Enter:
# AWS Access Key ID: ***
# AWS Secret Access Key: ***
# Default region: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### 3. Create IAM Role for AppRunner

**Via AWS Console:**
```
IAM → Roles → Create Role
Service: App Runner
Add Policy: AmazonEC2ContainerRegistryReadOnly
Add Policy: CloudWatchLogsFullAccess
```

**Trust Relationship:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "tasks.apprunner.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

---

## 🚀 Manual Deployment

### Step 1: Build Docker Image

```bash
# Navigate to project
cd cleancraft-next-demo

# Build image
docker build \
  --build-arg NODE_ENV=production \
  -t cleancraft:latest .

# Verify image
docker images cleancraft
```

### Step 2: Push to ECR

```bash
# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1

# Login to ECR
aws ecr get-login-password --region $REGION | \
  docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

# Tag image for ECR
docker tag cleancraft:latest $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/cleancraft:latest

# Push to ECR
docker push $ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/cleancraft:latest

# Verify in ECR
aws ecr describe-images --repository-name cleancraft --region $REGION
```

### Step 3: Create AppRunner Service

```bash
# Set variables
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1
ROLE_ARN="arn:aws:iam::$ACCOUNT_ID:role/AppRunnerServiceRole"

# Create service
aws apprunner create-service \
  --service-name cleancraft \
  --source-configuration ImageRepository='{"ImageRepositoryType":"ECR","ImageIdentifier":"'$ACCOUNT_ID'.dkr.ecr.'$REGION'.amazonaws.com/cleancraft:latest","ImageConfiguration":{"Port":"3000","RuntimeEnvironmentVariables":{"NODE_ENV":"production"}}}' \
  --instance-configuration InstanceRoleArn=$ROLE_ARN,Cpu=1024,Memory=2048,EphemeralStorageSize=1 \
  --region $REGION
```

### Step 4: Configure Environment Variables

```bash
# Update service with environment variables
aws apprunner update-service \
  --service-arn arn:aws:apprunner:$REGION:$ACCOUNT_ID:service/cleancraft/$(uuidgen) \
  --instance-configuration RuntimeEnvironmentVariables='{
    "NODE_ENV":"production",
    "NEXT_PUBLIC_SUPABASE_URL":"https://your-project.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY":"your_anon_key",
    "NEXT_PUBLIC_STRAPI_URL":"https://your-strapi.com",
    "NEXT_PUBLIC_STRAPI_API_TOKEN":"your_token",
    "REDIS_PASSWORD":"your_password"
  }' \
  --region $REGION
```

### Step 5: Verify Deployment

```bash
# Get service status
aws apprunner describe-service \
  --service-arn arn:aws:apprunner:$REGION:$ACCOUNT_ID:service/cleancraft/... \
  --region $REGION

# Check logs in CloudWatch
aws logs tail /aws/apprunner/cleancraft/service --follow
```

---

## 🔄 CI/CD Setup with GitHub Actions

### Step 1: Add GitHub Secrets

In your GitHub repository:
```
Settings → Secrets and variables → Actions → New repository secret
```

Add these secrets:
```
AWS_REGION = us-east-1
AWS_ACCOUNT_ID = 123456789012
AWS_ACCESS_KEY_ID = AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
ECR_REPOSITORY = cleancraft
APPRUNNER_SERVICE_ARN = arn:aws:apprunner:us-east-1:123456789012:service/cleancraft/...
```

### Step 2: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy to AWS AppRunner

on:
  push:
    branches:
      - main
      - staging
  pull_request:
    branches:
      - main

env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  ECR_REPOSITORY: ${{ secrets.ECR_REPOSITORY }}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Deploy to AWS AppRunner
        if: github.ref == 'refs/heads/main'
        run: |
          aws apprunner create-deployment \
            --service-arn ${{ secrets.APPRUNNER_SERVICE_ARN }} \
            --region ${{ env.AWS_REGION }}

      - name: Wait for deployment
        if: github.ref == 'refs/heads/main'
        run: |
          aws apprunner wait service-deployment-successful \
            --service-arn ${{ secrets.APPRUNNER_SERVICE_ARN }} \
            --region ${{ env.AWS_REGION }} \
            --max-attempts 30 --delay 10

      - name: Notify deployment status
        if: always()
        run: |
          STATUS=${{ job.status }}
          echo "Deployment Status: $STATUS"
```

### Step 3: Test CI/CD Pipeline

```bash
# Push to main branch
git add .
git commit -m "Deploy to production"
git push origin main

# Monitor in GitHub
Settings → Actions → Workflow runs
```

---

## ⚙️ Production Configuration

### Environment Variables (Production)

```env
# Application
NODE_ENV=production
LOG_LEVEL=info

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Strapi
NEXT_PUBLIC_STRAPI_URL=https://api.yourdomain.com
NEXT_PUBLIC_STRAPI_API_TOKEN=your_token

# Application URLs
NEXT_PUBLIC_APP_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com

# Security
SESSION_SECRET=generate_a_random_string_here
JWT_SECRET=generate_a_random_string_here

# Features
ENABLE_ANALYTICS=true
ENABLE_RATE_LIMITING=true
ENABLE_HTTPS_REDIRECT=true
```

### Health Check Configuration

AppRunner automatically checks:
```
GET / HTTP/1.1
Expected Status: 200
Interval: 30 seconds
Timeout: 10 seconds
Healthy Threshold: 3
Unhealthy Threshold: 3
```

### Auto-Scaling Configuration

**Via AWS Console:**
```
AppRunner Service → Deployment settings → Auto scaling
- Min instances: 1
- Max instances: 10
- Target CPU utilization: 70%
- Target memory utilization: 80%
```

---

## 📊 Monitoring & Maintenance

### CloudWatch Metrics

```bash
# View CPU utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppRunner \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=cleancraft \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average

# View memory utilization
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppRunner \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=cleancraft \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

### CloudWatch Logs

```bash
# View recent logs
aws logs tail /aws/apprunner/cleancraft/service

# Follow logs in real-time
aws logs tail /aws/apprunner/cleancraft/service --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /aws/apprunner/cleancraft/service \
  --filter-pattern "ERROR"
```

### Application Health Dashboard

Create custom CloudWatch dashboard:
```bash
aws cloudwatch put-dashboard \
  --dashboard-name CleanCraft-Monitoring \
  --dashboard-body file://dashboard.json
```

### Alerts & Notifications

Set up CloudWatch alarms:
```bash
# High CPU alert
aws cloudwatch put-metric-alarm \
  --alarm-name cleancraft-high-cpu \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/AppRunner \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789:alerts

# Service down alert
aws cloudwatch put-metric-alarm \
  --alarm-name cleancraft-service-down \
  --alarm-description "Alert when service is down" \
  --metric-name HealthyInstanceCount \
  --namespace AWS/AppRunner \
  --statistic Average \
  --period 60 \
  --threshold 1 \
  --comparison-operator LessThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789:alerts
```

### Regular Maintenance

**Weekly:**
- Check CloudWatch logs for errors
- Monitor resource utilization
- Review failed deployments

**Monthly:**
- Update dependencies
- Security scanning
- Performance review
- Cost analysis

**Quarterly:**
- Capacity planning
- Architecture review
- Disaster recovery testing
- Security audit

---

## 🐛 Troubleshooting

### Deployment Fails

**Check CloudWatch logs:**
```bash
aws logs tail /aws/apprunner/cleancraft/service --follow
```

**Common issues:**
- Invalid Docker image - Check ECR push
- Environment variables missing - Verify secrets
- Health check failing - Check application startup

### Service Won't Start

```bash
# Get service status
aws apprunner describe-service \
  --service-arn <SERVICE_ARN> \
  --query 'Service.Status' \
  --output text

# Check recent deployment
aws apprunner list-deployments \
  --service-arn <SERVICE_ARN> \
  --query 'Deployments[0]'
```

### High Latency

```bash
# Check average response time
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppRunner \
  --metric-name ResponseTime \
  --dimensions Name=ServiceName,Value=cleancraft \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 60 \
  --statistics Average

# Increase instance size or count
aws apprunner update-service \
  --service-arn <SERVICE_ARN> \
  --instance-configuration Cpu=2048,Memory=4096
```

### Database Connection Issues

```bash
# Verify Supabase is reachable
curl https://your-project.supabase.co/rest/v1/

# Check credentials in environment
aws apprunner describe-service \
  --service-arn <SERVICE_ARN> \
  --query 'Service.InstanceConfiguration.RuntimeEnvironmentVariables'
```

### Out of Memory

```bash
# Check memory usage
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppRunner \
  --metric-name MemoryUtilization \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 60 \
  --statistics Maximum

# Increase memory
aws apprunner update-service \
  --service-arn <SERVICE_ARN> \
  --instance-configuration Memory=4096
```

---

## 📈 Cost Optimization

### AppRunner Pricing
- Compute: $0.07/vCPU-hour
- Memory: $0.007/GB-hour
- Requests: $0.001/million requests

### Cost Optimization Tips

1. **Right-size instances**
   - Start with 1 vCPU, 2GB RAM
   - Monitor and adjust based on usage

2. **Enable auto-scaling**
   - Scale down when not needed
   - Reduce peak costs

3. **Use spot instances (if available)**
   - Up to 70% savings
   - Good for non-production

4. **Optimize database**
   - Connection pooling
   - Query optimization
   - Appropriate indexes

5. **CDN usage**
   - CloudFront for static assets
   - Reduce origin requests

### Estimated Monthly Cost (Small Instance)
```
1 vCPU × $0.07 × 730 hours = $51.10
2GB RAM × $0.007 × 730 hours = $10.22
Total: ~$61.32/month (1 instance, continuous)
```

---

## ✅ Deployment Checklist

- [ ] AWS Account created and configured
- [ ] ECR repository created
- [ ] IAM role with proper permissions
- [ ] Docker image builds successfully
- [ ] Image pushes to ECR
- [ ] AppRunner service created
- [ ] Environment variables configured
- [ ] Health checks passing
- [ ] GitHub Actions secrets added
- [ ] CI/CD workflow created and tested
- [ ] CloudWatch monitoring set up
- [ ] Alarms configured
- [ ] DNS configured (if custom domain)
- [ ] SSL/TLS certificate configured
- [ ] Production database configured
- [ ] Backup strategy in place

---

## 📚 Resources

- [AWS AppRunner Documentation](https://docs.aws.amazon.com/apprunner/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Cost Calculator](https://calculator.aws/)

---

## 🆘 Support

**Issues:**
- Check CloudWatch logs
- Review GitHub Actions workflow
- Verify environment variables
- Test locally with Docker

**Documentation:**
- [README.md](README.md) - Project overview
- [DOCKER.md](DOCKER.md) - Docker configuration
- [supabase/README.md](supabase/README.md) - Database setup

---

**Last Updated:** February 2026
**Status:** Production Ready ✅

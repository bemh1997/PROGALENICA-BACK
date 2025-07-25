module.exports = {
  apps: [{
    name: 'progalenica',
    script: './index.js',
    instances: 1,
    autorestart: true,
    watch: false,
  }],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'ec2-34-224-99-147.compute-1.amazonaws.com',
      ref: 'origin/main',
      repo: 'git@github.com:bemh1997/PROGALENICA-BACK.git',
      path: '/home/ubuntu/app/PROGALENICA-BACK',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --only progalenica'
    }
  }
};


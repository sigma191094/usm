#!/usr/bin/env node
// kill-port.js - Libère le port 3001 avant le démarrage
const { execSync } = require('child_process');
const PORT = 3001;

try {
  if (process.platform === 'win32') {
    // Windows: trouver et tuer le processus sur le port 3001
    const result = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    const lines = result.trim().split('\n');
    const pids = new Set();
    
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && /^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }
    
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
        console.log(`✅ Processus ${pid} terminé (port ${PORT} libéré)`);
      } catch (e) {
        // Processus déjà terminé, ignorer
      }
    }
  } else {
    // Linux/Mac
    execSync(`fuser -k ${PORT}/tcp`, { stdio: 'ignore' });
    console.log(`✅ Port ${PORT} libéré`);
  }
} catch (e) {
  // Aucun processus sur le port, c'est bien
  console.log(`✅ Port ${PORT} est libre`);
}

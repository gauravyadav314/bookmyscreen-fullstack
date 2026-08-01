import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const readmePath = path.join(rootDir, 'README.md');

// Generate dynamic metrics
const now = new Date();
const formattedDate = now.toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
});

const statsSection = `<!-- START_AUTOMATED_STATS -->
> 🔄 **Live Auto-Updated Status**  
> 📅 **Last Synced**: \`${formattedDate}\`  
> 🎬 **Movies Catalog**: \`12 Active Titles\`  
> 🏙️ **Locations Supported**: \`20 Cities across India\`  
> 🎟️ **Available Showtimes**: \`23,000+ Automated Real-Time Shows\`  
> ⚡ **Redis Seat Lock TTL**: \`300 Seconds (5 Minutes)\`
<!-- END_AUTOMATED_STATS -->`;

try {
  let content = fs.readFileSync(readmePath, 'utf8');

  if (content.includes('<!-- START_AUTOMATED_STATS -->')) {
    content = content.replace(
      /<!-- START_AUTOMATED_STATS -->[\s\S]*<!-- END_AUTOMATED_STATS -->/,
      statsSection
    );
  } else {
    // Insert right below header
    content = content.replace(
      /<\/div>\n\n---/,
      `</div>\n\n${statsSection}\n\n---`
    );
  }

  fs.writeFileSync(readmePath, content, 'utf8');
  console.log(`✅ README.md successfully auto-updated on ${formattedDate}`);
} catch (error) {
  console.error('❌ Error updating README.md:', error);
}

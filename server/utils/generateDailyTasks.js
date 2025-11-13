const fs = require("fs");

module.exports = function generateDailyTasks() {
  const tasks = JSON.parse(fs.readFileSync("./seed/masterTasks.json", "utf-8"));

  // Shuffle
  tasks.sort(() => Math.random() - 0.5);

  // Pick first 5
  return tasks.slice(0, 5).map(t => ({ name: t, done: false }));
};

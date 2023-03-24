module.exports = (err) => {
  console.log(`Rejected Promise Error💃:\n ${err.name} ${err.message}`);
  console.log('UNCAUGHT EXCEPTION/REJECTION/PROMISE: APP SHUTTING DOWN...');
  process.exit(1);
}
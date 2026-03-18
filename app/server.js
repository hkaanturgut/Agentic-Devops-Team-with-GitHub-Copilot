const app = require('./index');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Task Management API running on port ${PORT}`);
});

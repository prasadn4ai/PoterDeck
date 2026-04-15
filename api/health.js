export default async function handler(req, res) {
  return res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    version: '1.0.0-beta',
  });
}

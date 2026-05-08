export default async function handler(request, response) {
  try {
    const res = await fetch('http://api.open-notify.org/astros.json');
    if (!res.ok) throw new Error('Failed to fetch from open-notify');
    const data = await res.json();
    response.status(200).json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    response.status(500).json({ message: 'Error fetching astronauts' });
  }
}

// netlify/functions/proxy.js

// Si necesitas compatibilidad con fetch en Node <18, descomenta la siguiente línea:
// import fetch from 'node-fetch';

export async function handler(event, context) {
  const { url } = event.queryStringParameters || {}

  if (!url) {
    return {
      statusCode: 400,
      body: 'Missing "url" query parameter'
    }
  }

  try {
    // Reenvía la petición al origen
    const resp = await fetch(url, {
      // opcional: propaga cabeceras de usuario
      headers: { 'User-Agent': event.headers['user-agent'] }
    })

    // Clona cabeceras y añade CORS
    const headers = {}
    resp.headers.forEach((value, key) => {
      headers[key] = value
    })
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'GET,HEAD,OPTIONS'
    headers['Access-Control-Allow-Headers'] = '*'

    // Devolver el cuerpo tal cual llega (arrayBuffer para binarios)
    const body = await resp.arrayBuffer()
    return {
      statusCode: resp.status,
      headers,
      body: Buffer.from(body).toString('base64'),
      isBase64Encoded: true
    }

  } catch (err) {
    return {
      statusCode: 502,
      body: 'Error proxying request: ' + err.message
    }
  }
}

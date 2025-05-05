// netlify/functions/proxy.js

export async function handler(event, context) {
+  // 1. Atender preflight CORS
+  if (event.httpMethod === 'OPTIONS') {
+    return {
+      statusCode: 204,
+      headers: {
+        'Access-Control-Allow-Origin': '*',
+        'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
+        'Access-Control-Allow-Headers': '*',
+      }
+    };
+  }

  const { url } = event.queryStringParameters || {};
  if (!url) {
    return { statusCode: 400, body: 'Missing "url" parameter' };
  }

  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': event.headers['user-agent'] }
    });

    // 2. Reconstruir headers excluyendo content‑length
-    const headers = {};
+    const headersOut = {};
    resp.headers.forEach((value, key) => {
-      headers[key] = value
+      if (key.toLowerCase() !== 'content-length') {
+        headersOut[key] = value;
+      }
    });

+    // 3. Forzar CORS
+    headersOut['Access-Control-Allow-Origin']  = '*';
+    headersOut['Access-Control-Allow-Methods'] = 'GET,HEAD,OPTIONS';
+    headersOut['Access-Control-Allow-Headers'] = '*';

    // 4. Leer body como arrayBuffer y enviar en base64
    const buf = await resp.arrayBuffer();
    return {
      statusCode: resp.status,
-      headers,
-      body: Buffer.from(body).toString('base64'),
+      headers: headersOut,
+      body:   Buffer.from(buf).toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 502, body: 'Proxy error: ' + err.message };
  }
}

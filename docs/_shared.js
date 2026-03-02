export function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

export function save(k, v) {
  try { sessionStorage.setItem(k, JSON.stringify(v)); } catch {}
}
export function load(k, fallback=null) {
  try {
    const v = sessionStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

export function print(el, obj) {
  el.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

export async function postFetch(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(body || {})
  });
  const txt = await r.text();
  let data;
  try { data = JSON.parse(txt); } catch { data = txt; }
  if (!r.ok) throw { status: r.status, data };
  return data;
}

export function postXHR(url, body, cb) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => {
    let data;
    try { data = JSON.parse(xhr.responseText); } catch { data = xhr.responseText; }
    cb(null, { status: xhr.status, data });
  };
  xhr.onerror = () => cb(new Error("XHR error"));
  xhr.send(JSON.stringify(body || {}));
}
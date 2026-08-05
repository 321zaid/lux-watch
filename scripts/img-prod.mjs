import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "public", "products");

async function tint(src, dst, rgb, strength) {
  const { data, info } = await sharp(path.join(dir, src))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = Buffer.from(data);
  const { r, g, b } = rgb;
  for (let i = 0; i < px.length; i += 4) {
    const a = px[i + 3] / 255;
    const s = strength * a;
    px[i] = Math.round(px[i] * (1 - s) + r * s);
    px[i + 1] = Math.round(px[i + 1] * (1 - s) + g * s);
    px[i + 2] = Math.round(px[i + 2] * (1 - s) + b * s);
  }
  await sharp(px, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 88 })
    .toFile(path.join(dir, dst));
  console.log("tint", dst);
}

(async () => {
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".png"))) {
    await sharp(path.join(dir, f))
      .webp({ quality: 90 })
      .toFile(path.join(dir, f.replace(".png", ".webp")));
    fs.unlinkSync(path.join(dir, f));
    console.log("webp", f);
  }
  await tint("shot-angle.webp", "watch-gold.webp", { r: 0.72, g: 0.55, b: 0.32 }, 0.45);
  await tint("shot-angle.webp", "watch-rose.webp", { r: 0.78, g: 0.52, b: 0.5 }, 0.4);
  await tint("shot-angle.webp", "watch-navy.webp", { r: 0.12, g: 0.22, b: 0.42 }, 0.5);
  await tint("shot-angle.webp", "watch-bronze.webp", { r: 0.55, g: 0.4, b: 0.24 }, 0.5);
  await tint("shot-crown.webp", "watch-gold-crown.webp", { r: 0.72, g: 0.55, b: 0.32 }, 0.45);
  const sizes = fs.readdirSync(dir).map((f) => `${f}: ${(fs.statSync(path.join(dir, f)).size / 1024).toFixed(0)}kb`);
  console.log(sizes.join("\n"));
})().catch((e) => { console.error(e); process.exit(1); });

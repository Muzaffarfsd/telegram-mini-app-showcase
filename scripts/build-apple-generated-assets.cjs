// Assemble generated illustrations and responsive local copies.
// Each input is an independently generated product/finish, not an Apple photo.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
require('tsx/cjs');
const { appleCatalog2026 } = require('../client/src/components/demos/appleCatalog2026.ts');

async function main() {
  const partial = process.argv.includes('--partial');
  const manifestNames = ['generated-phones.json','generated-computers.json','generated-wearables.json','generated-accessories.json'];
  const combined = {};
  for (const name of manifestNames) {
    let entries;
    try { entries = JSON.parse(await fs.readFile(path.join('scripts',name),'utf8')); }
    catch (error) { if (partial && error.code === 'ENOENT') continue; throw error; }
    for (const [id, colors] of Object.entries(entries)) {
      if (combined[id]) throw new Error(`Duplicate product: ${id}`);
      combined[id] = colors;
    }
  }
  for (const name of ['generated-extra-phones.json','generated-extra-computers.json','generated-extra-wearables.json']) {
    let extras;
    try { extras = JSON.parse(await fs.readFile(path.join('scripts',name),'utf8')); }
    catch (error) { if (error.code==='ENOENT') continue; throw error; }
    for (const [id, colors] of Object.entries(extras)) for (const [color, paths] of Object.entries(colors)) {
      if (!Array.isArray(combined[id]?.[color]) || !Array.isArray(paths)) throw new Error(`Extra image has no matching product and finish: ${id} / ${color}`);
      combined[id][color].push(...paths);
    }
  }
  const root = path.join('client','public');
  const outDir = path.join(root,'apple-store','generated');
  const sizeDir = path.join(outDir,'sizes');
  await fs.mkdir(sizeDir,{recursive:true});
  const compiled = {};
  for (const item of appleCatalog2026) {
    compiled[item.id] = {};
    for (const color of item.colors) {
      const entries = combined[item.id]?.[color];
      if (!Array.isArray(entries) || !entries.length) { if (partial) continue; throw new Error(`Missing generated illustration: ${item.id} / ${color}`); }
      compiled[item.id][color] = [];
      for (const relative of entries) {
        if (!relative.startsWith('/apple-store/generated/') || relative.includes('..')) throw new Error(`Invalid generated path: ${relative}`);
        const src = path.join(root,relative.slice(1));
        const input = sharp(src);
        const metadata = await input.metadata();
        if (!metadata.hasAlpha) throw new Error(`Missing transparency: ${relative}`);
        const stats = await input.stats();
        if (stats.channels.at(-1).min !== 0 || stats.channels.at(-1).max < 200) throw new Error(`Invalid alpha: ${relative}`);
        const alpha = await sharp(src).extractChannel('alpha').raw().toBuffer({resolveWithObject:true});
        const {width,height} = alpha.info;
        const corners = [0,width-1,(height-1)*width,height*width-1].map(index=>alpha.data[index]);
        if (corners.some(value=>value>16)) throw new Error(`Background is not transparent at the image edges: ${relative}`);
        if (metadata.width < 940) throw new Error(`Insufficient image width: ${relative} (${metadata.width})`);
        const name = path.basename(relative,path.extname(relative));
        const target = path.join(outDir,`${name}.webp`);
        if (path.extname(relative).toLowerCase() !== '.webp') await sharp(src).resize({width:940,withoutEnlargement:true}).webp({quality:84,alphaQuality:100}).toFile(target);
        const actual = await sharp(target).metadata();
        if (actual.width !== 940 || !actual.hasAlpha) throw new Error(`Invalid optimized image: ${target}`);
        for (const width of [160,480]) await sharp(target).resize({width}).webp({quality:82,alphaQuality:100}).toFile(path.join(sizeDir,`${name}-${width}.webp`));
        compiled[item.id][color].push(`/apple-store/generated/${name}.webp`);
      }
    }
  }
  const file = 'client/src/components/demos/appleGeneratedProductImages.ts';
  await fs.writeFile(file,`/** Generated product illustrations, keyed by exact product and finish. */\nexport const appleGeneratedProductImages:Record<string,Record<string,string[]>> = ${JSON.stringify(compiled,null,2)};\n\nexport function generatedProductPhotos(id:string, color:string):string[] {\n  return appleGeneratedProductImages[id]?.[color] || [];\n}\n`);
  const coveredProducts = Object.values(compiled).filter(colors=>Object.keys(colors).length).length;
  const coveredFinishes = Object.values(compiled).reduce((n,colors)=>n+Object.keys(colors).length,0);
  console.log(`Generated illustrations validated: ${coveredProducts}/${appleCatalog2026.length} products, ${coveredFinishes}/${appleCatalog2026.reduce((n,x)=>n+x.colors.length,0)} finishes.`);
}
main().catch(error=>{console.error(error);process.exitCode=1});

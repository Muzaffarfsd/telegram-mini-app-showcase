// Rebuild responsive sizes of the earlier generated, transparent illustrations.
const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
async function main(){
  const root='client/public/apple-store/creative', dest=path.join(root,'sizes');
  await fs.mkdir(dest,{recursive:true});
  const widths={};
  for(const file of (await fs.readdir(root)).filter(name=>name.endsWith('.webp')).sort()){
    const input=path.join(root,file),meta=await sharp(input).metadata();
    if(!meta.hasAlpha || !meta.width || meta.width<940)throw new Error(`Invalid generated image: ${file}`);
    widths[file]=meta.width;
    for(const width of [160,480,940]) await sharp(input).resize({width}).webp({quality:82,alphaQuality:100}).toFile(path.join(dest,`${file.slice(0,-5)}-${width}.webp`));
  }
  await fs.writeFile('client/src/components/demos/appleCreativeSizes2026.ts',`/** Dimensions of generated original assets; derived WebP files retain alpha. */\nexport const appleCreativeWidths:Record<string,number> = ${JSON.stringify(widths,null,2)};\n`);
  console.log(`Built responsive sizes for ${Object.keys(widths).length} generated illustrations.`);
}
main().catch(error=>{console.error(error);process.exitCode=1});

import { get_model_files } from './node_modules/@huggingface/transformers/src/utils/model_registry/get_model_files.js';

async function test() {
    try {
        const files = await get_model_files('briaai/RMBG-1.4', {
            dtype: 'fp32',
            device: 'wasm',
        });
        console.log('Model files for RMBG-1.4 (fp32, wasm):');
        files.forEach(f => console.log(`  ${f}`));
        
        console.log('\n\nModel files for RMBG-1.4 (fp32, webgpu):');
        const filesWebGPU = await get_model_files('briaai/RMBG-1.4', {
            dtype: 'fp32',
            device: 'webgpu',
        });
        filesWebGPU.forEach(f => console.log(`  ${f}`));
    } catch (e) {
        console.error('Error:', e.message);
    }
}

test();

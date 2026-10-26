import type {NextConfig} from 'next';
const config:NextConfig={output:'standalone',devIndicators:false,allowedDevOrigins:['127.0.0.1','localhost'],experimental:{cpus:2}};
export default config;

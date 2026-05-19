// ═══════════════════════════════════════════════════════════════
// instance.js - Axios instance creation
// ═══════════════════════════════════════════════════════════════

import axios from 'axios';
import { baseConfig } from './baseConfig.js';

export const instance = axios.create(baseConfig);

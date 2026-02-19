/**
 * @file sound-effects.ts
 * @description 音效播放工具 - 使用 Web Audio API 生成简单音效
 * @author InkWords Team
 * @date 2026-02-19
 * @version 1.0.0
 */

/**
 * 音效类型
 */
export type SoundType = 'success' | 'error' | 'click' | 'complete';

/**
 * 音效配置
 */
interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
}

/**
 * 预设音效配置
 */
const SOUND_PRESETS: Record<SoundType, SoundConfig> = {
  // 正确音效 - 愉悦的上升音调
  success: {
    frequency: 880, // A5
    duration: 0.15,
    type: 'sine',
    volume: 0.3,
  },
  // 错误音效 - 低沉的下降音调
  error: {
    frequency: 220, // A3
    duration: 0.3,
    type: 'sawtooth',
    volume: 0.2,
  },
  // 点击音效 - 短促的提示音
  click: {
    frequency: 600,
    duration: 0.05,
    type: 'sine',
    volume: 0.1,
  },
  // 完成音效 - 胜利和弦
  complete: {
    frequency: 523.25, // C5
    duration: 0.5,
    type: 'sine',
    volume: 0.3,
  },
};

/**
 * 音频上下文（懒加载）
 */
let audioContext: AudioContext | null = null;

/**
 * 获取或创建音频上下文
 * @returns AudioContext 实例
 */
function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('[SoundEffects] 音频上下文创建失败:', e);
      return null;
    }
  }
  
  return audioContext;
}

/**
 * 播放音效
 * @param type - 音效类型
 * @returns Promise<void>
 */
export async function playSound(type: SoundType): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  // 恢复音频上下文（解决浏览器自动播放策略）
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      console.warn('[SoundEffects] 恢复音频上下文失败:', e);
      return;
    }
  }

  const config = SOUND_PRESETS[type];
  if (!config) {
    console.warn('[SoundEffects] 未知音效类型:', type);
    return;
  }

  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

    // 设置音量
    gainNode.gain.setValueAtTime(config.volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);

    // 特殊处理：成功音效添加和声效果
    if (type === 'success') {
      const harmonic = ctx.createOscillator();
      const harmonicGain = ctx.createGain();
      
      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(config.frequency * 1.5, ctx.currentTime); // 五度音
      harmonicGain.gain.setValueAtTime(config.volume * 0.3, ctx.currentTime);
      harmonicGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
      
      harmonic.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);
      
      harmonic.start(ctx.currentTime);
      harmonic.stop(ctx.currentTime + config.duration);
    }

    // 特殊处理：错误音效添加滑音效果
    if (type === 'error') {
      oscillator.frequency.exponentialRampToValueAtTime(
        config.frequency * 0.5,
        ctx.currentTime + config.duration
      );
    }

    // 特殊处理：完成音效添加和弦
    if (type === 'complete') {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (大三和弦)
      notes.forEach((freq, index) => {
        const noteOsc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        
        noteOsc.type = 'sine';
        noteOsc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
        noteGain.gain.setValueAtTime(config.volume * 0.3, ctx.currentTime + index * 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration + index * 0.1);
        
        noteOsc.connect(noteGain);
        noteGain.connect(ctx.destination);
        
        noteOsc.start(ctx.currentTime + index * 0.1);
        noteOsc.stop(ctx.currentTime + config.duration + index * 0.1);
      });
    }
  } catch (e) {
    console.warn('[SoundEffects] 播放音效失败:', e);
  }
}

/**
 * 播放正确音效
 */
export function playSuccessSound(): void {
  playSound('success');
}

/**
 * 播放错误音效
 */
export function playErrorSound(): void {
  playSound('error');
}

/**
 * 播放点击音效
 */
export function playClickSound(): void {
  playSound('click');
}

/**
 * 播放完成音效
 */
export function playCompleteSound(): void {
  playSound('complete');
}

/**
 * 预加载音频上下文（在用户交互时调用）
 * 这可以解决浏览器的自动播放策略限制
 */
export function initAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {
      // 忽略错误，将在播放时再次尝试
    });
  }
}

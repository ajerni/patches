/**
 * Patch Schema SVG Symbol Registry
 * This file contains references to all available SVG symbols for the patch schema editor
 */

export interface SymbolDefinition {
  id: string;
  name: string;
  category: 'audio-sources' | 'audio-modifiers' | 'cv-sources' | 'cv-modifiers';
  svgPath: string;
}

export const PATCH_SCHEMA_SYMBOLS: SymbolDefinition[] = [
  // Audio Sources
  { id: 'audio-src', name: 'Audio Source', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/audio-src.svg' },
  { id: 'granular-synth', name: 'Granular Synth', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/granular-synth.svg' },
  { id: 'microphone-input', name: 'Microphone Input', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/microphone-input.svg' },
  { id: 'noise', name: 'Noise', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/noise.svg' },
  { id: 'physical-mod-generic', name: 'Physical Model', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/physical-mod-generic.svg' },
  { id: 'physical-mod-membrane', name: 'PM Membrane', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/physical-mod-membrane.svg' },
  { id: 'physical-mod-pipe', name: 'PM Pipe', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/physical-mod-pipe.svg' },
  { id: 'physical-mod-string', name: 'PM String', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/physical-mod-string.svg' },
  { id: 'sample-player', name: 'Sample Player', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/sample-player.svg' },
  { id: 'sample-rec', name: 'Sample Recorder', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/sample-rec.svg' },
  { id: 'speech-synthesis', name: 'Speech Synthesis', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/speech-synthesis.svg' },
  { id: 'vco-pwm', name: 'VCO PWM', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/vco-pwm.svg' },
  { id: 'vco-ramp', name: 'VCO Ramp', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/vco-ramp.svg' },
  { id: 'vco-saw', name: 'VCO Sawtooth', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/vco-saw.svg' },
  { id: 'vco-sine', name: 'VCO Sine', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/vco-sine.svg' },
  { id: 'vco-square', name: 'VCO Square', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/vco-square.svg' },
  { id: 'vco-triangle', name: 'VCO Triangle', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/vco-triangle.svg' },
  { id: 'vco-wavetable', name: 'VCO Wavetable', category: 'audio-sources', svgPath: '/patch_schemas/audio-sources/vco-wavetable.svg' },

  // Audio Modifiers
  { id: 'attenuator', name: 'Attenuator', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/attenuator.svg' },
  { id: 'audio-processor-generic', name: 'Audio Processor', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/audio-processor-generic.svg' },
  { id: 'chorus', name: 'Chorus', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/chorus.svg' },
  { id: 'clipper', name: 'Clipper', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/clipper.svg' },
  { id: 'crossfader', name: 'Crossfader', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/crossfader.svg' },
  { id: 'delay', name: 'Delay', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/delay.svg' },
  { id: 'inverter', name: 'Inverter', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/inverter.svg' },
  { id: 'lpg', name: 'LPG', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/lpg.svg' },
  { id: 'mixer-inverting', name: 'Mixer (Inverting)', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/mixer-inverting.svg' },
  { id: 'mixer', name: 'Mixer', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/mixer.svg' },
  { id: 'phase-shifter', name: 'Phase Shifter', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/phase-shifter.svg' },
  { id: 'rectifier-full', name: 'Rectifier (Full)', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/rectifier-full.svg' },
  { id: 'rectifier-half', name: 'Rectifier (Half)', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/rectifier-half.svg' },
  { id: 'resonator', name: 'Resonator', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/resonator.svg' },
  { id: 'reverb', name: 'Reverb', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/reverb.svg' },
  { id: 'ringmod', name: 'Ring Modulator', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/ringmod.svg' },
  { id: 'switch', name: 'Switch', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/switch.svg' },
  { id: 'vca', name: 'VCA', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/vca.svg' },
  { id: 'vcf-bandpass', name: 'VCF Bandpass', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/vcf-bandpass.svg' },
  { id: 'vcf-comb', name: 'VCF Comb', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/vcf-comb.svg' },
  { id: 'vcf-highpass-res', name: 'VCF Highpass (Res)', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/vcf-highpass-res.svg' },
  { id: 'vcf-highpass', name: 'VCF Highpass', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/vcf-highpass.svg' },
  { id: 'vcf-lowpass-res', name: 'VCF Lowpass (Res)', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/vcf-lowpass-res.svg' },
  { id: 'vcf-lowpass', name: 'VCF Lowpass', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/vcf-lowpass.svg' },
  { id: 'vcf-notch', name: 'VCF Notch', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/vcf-notch.svg' },
  { id: 'wavefolder', name: 'Wavefolder', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/wavefolder.svg' },
  { id: 'waveshaper', name: 'Waveshaper', category: 'audio-modifiers', svgPath: '/patch_schemas/audio-modifiers/waveshaper.svg' },

  // CV Sources
  { id: 'bias-voltage', name: 'Bias Voltage', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/bias-voltage.svg' },
  { id: 'cv-recorder', name: 'CV Recorder', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/cv-recorder.svg' },
  { id: 'cv-src-generic', name: 'CV Source', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/cv-src-generic.svg' },
  { id: 'env-ad-loop', name: 'Env AD (Loop)', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-ad-loop.svg' },
  { id: 'env-ad', name: 'Env AD', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-ad.svg' },
  { id: 'env-adsr-loop', name: 'Env ADSR (Loop)', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-adsr-loop.svg' },
  { id: 'env-adsr', name: 'Env ADSR', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-adsr.svg' },
  { id: 'env-ahdsr-loop', name: 'Env AHDSR (Loop)', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-ahdsr-loop.svg' },
  { id: 'env-ahdsr', name: 'Env AHDSR', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-ahdsr.svg' },
  { id: 'env-ar-loop', name: 'Env AR (Loop)', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-ar-loop.svg' },
  { id: 'env-ar', name: 'Env AR', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-ar.svg' },
  { id: 'env-dadsr-loop', name: 'Env DADSR (Loop)', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-dadsr-loop.svg' },
  { id: 'env-dasdr', name: 'Env DASDR', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/env-dasdr.svg' },
  { id: 'envelope-follower', name: 'Envelope Follower', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/envelope-follower.svg' },
  { id: 'keyboard-ctrl', name: 'Keyboard Control', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/keyboard-ctrl.svg' },
  { id: 'lfo-bpm-saw', name: 'LFO BPM Saw', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-bpm-saw.svg' },
  { id: 'lfo-bpm-sine', name: 'LFO BPM Sine', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-bpm-sine.svg' },
  { id: 'lfo-bpm-square', name: 'LFO BPM Square', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-bpm-square.svg' },
  { id: 'lfo-bpm-triangle', name: 'LFO BPM Triangle', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-bpm-triangle.svg' },
  { id: 'lfo-reset-sync', name: 'LFO Reset/Sync', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-reset-sync.svg' },
  { id: 'lfo-saw', name: 'LFO Sawtooth', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-saw.svg' },
  { id: 'lfo-sine', name: 'LFO Sine', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-sine.svg' },
  { id: 'lfo-square', name: 'LFO Square', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-square.svg' },
  { id: 'lfo-triangle', name: 'LFO Triangle', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/lfo-triangle.svg' },
  { id: 'master-clock', name: 'Master Clock', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/master-clock.svg' },
  { id: 'random-smooth', name: 'Random (Smooth)', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/random-smooth.svg' },
  { id: 'random-stepped', name: 'Random (Stepped)', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/random-stepped.svg' },
  { id: 'seq-cv-gate', name: 'Sequencer CV/Gate', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/seq-cv-gate.svg' },
  { id: 'touch-ctrl', name: 'Touch Control', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/touch-ctrl.svg' },
  { id: 'trigger-pattern-generator', name: 'Trigger Pattern Gen', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/trigger-pattern-generator.svg' },
  { id: 'voltage-slider', name: 'Voltage Slider', category: 'cv-sources', svgPath: '/patch_schemas/cv-sources/voltage-slider.svg' },

  // CV Modifiers
  { id: 'buffered-multiple', name: 'Buffered Multiple', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/buffered-multiple.svg' },
  { id: 'clock-divider', name: 'Clock Divider', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/clock-divider.svg' },
  { id: 'clock-multiplier', name: 'Clock Multiplier', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/clock-multiplier.svg' },
  { id: 'comparator', name: 'Comparator', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/comparator.svg' },
  { id: 'cv-attenuator', name: 'CV Attenuator', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-attenuator.svg' },
  { id: 'cv-attenuverter', name: 'CV Attenuverter', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-attenuverter.svg' },
  { id: 'cv-inverter', name: 'CV Inverter', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-inverter.svg' },
  { id: 'cv-matrix-mixer', name: 'CV Matrix Mixer', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-matrix-mixer.svg' },
  { id: 'cv-mixer-attenuverting', name: 'CV Mixer (Attenuverting)', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-mixer-attenuverting.svg' },
  { id: 'cv-mixer', name: 'CV Mixer', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-mixer.svg' },
  { id: 'cv-mod-generic', name: 'CV Modifier', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-mod-generic.svg' },
  { id: 'cv-rectifier-full', name: 'CV Rectifier (Full)', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-rectifier-full.svg' },
  { id: 'cv-rectifier-half', name: 'CV Rectifier (Half)', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-rectifier-half.svg' },
  { id: 'cv-switch', name: 'CV Switch', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-switch.svg' },
  { id: 'cv-utility-mixer', name: 'CV Utility Mixer', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/cv-utility-mixer.svg' },
  { id: 'gate-delay', name: 'Gate Delay', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/gate-delay.svg' },
  { id: 'logic-and', name: 'Logic AND', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/logic-and.svg' },
  { id: 'logic-nand', name: 'Logic NAND', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/logic-nand.svg' },
  { id: 'logic-nor', name: 'Logic NOR', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/logic-nor.svg' },
  { id: 'logic-not', name: 'Logic NOT', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/logic-not.svg' },
  { id: 'logic-or', name: 'Logic OR', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/logic-or.svg' },
  { id: 'logic-xnor', name: 'Logic XNOR', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/logic-xnor.svg' },
  { id: 'logic-xor', name: 'Logic XOR', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/logic-xor.svg' },
  { id: 'precision-adder', name: 'Precision Adder', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/precision-adder.svg' },
  { id: 'quantizer', name: 'Quantizer', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/quantizer.svg' },
  { id: 'sample-and-hold', name: 'Sample & Hold', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/sample-and-hold.svg' },
  { id: 'slew-limiter', name: 'Slew Limiter', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/slew-limiter.svg' },
  { id: 'vca-dc', name: 'VCA (DC)', category: 'cv-modifiers', svgPath: '/patch_schemas/cv-modifiers/vca-dc.svg' },
];

// Cable colors for different signal types
export const CABLE_COLORS = {
  audio: '#FFD700', // Yellow
  pitch: '#808080', // Gray
  cv: '#4169E1', // Blue
  gate: '#DC143C', // Red (triggers and gates)
  clock: '#32CD32', // Green (master clocks)
} as const;

export type CableType = keyof typeof CABLE_COLORS;

// Helper function to get symbols by category
export function getSymbolsByCategory(category: SymbolDefinition['category']): SymbolDefinition[] {
  return PATCH_SCHEMA_SYMBOLS.filter(symbol => symbol.category === category);
}

// Helper function to get symbol by ID
export function getSymbolById(id: string): SymbolDefinition | undefined {
  return PATCH_SCHEMA_SYMBOLS.find(symbol => symbol.id === id);
}


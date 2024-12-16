import { EnvironmentProviders, InjectionToken } from '@angular/core';
import type { CountdownConfig } from './interfaces';
export declare const COUNTDOWN_CONFIG: InjectionToken<CountdownConfig>;
export declare function provideCountdown(config?: CountdownConfig): EnvironmentProviders;

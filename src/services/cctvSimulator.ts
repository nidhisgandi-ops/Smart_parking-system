import { ParkingSpot, SpotStatus } from '../types';

export interface SpotDetectionEvent {
  spotId: string;
  facilityId: string;
  spotNumber: string;
  previousStatus: SpotStatus;
  newStatus: SpotStatus;
  confidenceScore: number;
  timestamp: string;
  cameraId: string;
  detectedVehicleType?: string;
}

export type SpotDetectionListener = (event: SpotDetectionEvent) => void;

/**
 * Interface representing CCTV AI Vision Detection service.
 * In production, a real YOLO/OpenCV/Edge-AI RTSP camera feed service implements this interface.
 */
export interface ICCTVDetector {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getIntervalMs(): number;
  setIntervalMs(ms: number): void;
  subscribe(listener: SpotDetectionListener): () => void;
  triggerManualFlip(spotId: string, newStatus: SpotStatus): void;
  simulateRushHour(spots: ParkingSpot[]): void;
}

export class SimulatedCCTVDetector implements ICCTVDetector {
  private active = false;
  private intervalMs = 5000;
  private timer: any = null;
  private listeners: Set<SpotDetectionListener> = new Set();
  private spotsRef: () => ParkingSpot[];
  private reservedSpotIds: Set<string> = new Set();

  constructor(spotsAccessor: () => ParkingSpot[]) {
    this.spotsRef = spotsAccessor;
  }

  public setReservedSpots(ids: string[]) {
    this.reservedSpotIds = new Set(ids);
  }

  public isRunning(): boolean {
    return this.active;
  }

  public getIntervalMs(): number {
    return this.intervalMs;
  }

  public setIntervalMs(ms: number): void {
    this.intervalMs = ms;
    if (this.active) {
      this.stop();
      this.start();
    }
  }

  public subscribe(listener: SpotDetectionListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public start(): void {
    if (this.active) return;
    this.active = true;
    this.scheduleNextTick();
  }

  public stop(): void {
    this.active = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private scheduleNextTick(): void {
    if (!this.active) return;
    // Add realistic jitter (± 1.5 seconds) to simulate asynchronous camera feed frames
    const jitter = (Math.random() - 0.5) * 3000;
    const delay = Math.max(2000, this.intervalMs + jitter);

    this.timer = setTimeout(() => {
      this.performDetectionCycle();
      this.scheduleNextTick();
    }, delay);
  }

  private performDetectionCycle(): void {
    const spots = this.spotsRef();
    if (!spots || spots.length === 0) return;

    // Pick 1-2 random eligible spots that are not no_parking and not reserved by user
    const flippableSpots = spots.filter(
      (s) => s.status !== 'no_parking' && !this.reservedSpotIds.has(s.id) && !s.heldUntil
    );

    if (flippableSpots.length === 0) return;

    const randomIndex = Math.floor(Math.random() * flippableSpots.length);
    const target = flippableSpots[randomIndex];

    // Flip between vacant and occupied
    const newStatus: SpotStatus = target.status === 'vacant' ? 'occupied' : 'vacant';
    const confidence = parseFloat((0.92 + Math.random() * 0.07).toFixed(3));

    const event: SpotDetectionEvent = {
      spotId: target.id,
      facilityId: target.facilityId,
      spotNumber: target.spotNumber,
      previousStatus: target.status,
      newStatus,
      confidenceScore: confidence,
      timestamp: new Date().toISOString(),
      cameraId: target.cctvCameraId || `CAM-ZONE-${Math.floor(Math.random() * 4) + 1}`,
      detectedVehicleType: newStatus === 'occupied' ? target.type : undefined,
    };

    this.broadcast(event);
  }

  public triggerManualFlip(spotId: string, newStatus: SpotStatus): void {
    const spots = this.spotsRef();
    const target = spots.find((s) => s.id === spotId);
    if (!target) return;

    const event: SpotDetectionEvent = {
      spotId: target.id,
      facilityId: target.facilityId,
      spotNumber: target.spotNumber,
      previousStatus: target.status,
      newStatus,
      confidenceScore: 0.99,
      timestamp: new Date().toISOString(),
      cameraId: target.cctvCameraId,
    };

    this.broadcast(event);
  }

  public simulateRushHour(spots: ParkingSpot[]): void {
    const vacantList = spots.filter((s) => s.status === 'vacant' && !this.reservedSpotIds.has(s.id));
    // Turn 70% of vacant spots into occupied
    const countToOccupy = Math.floor(vacantList.length * 0.7);
    for (let i = 0; i < countToOccupy; i++) {
      const sp = vacantList[i];
      const event: SpotDetectionEvent = {
        spotId: sp.id,
        facilityId: sp.facilityId,
        spotNumber: sp.spotNumber,
        previousStatus: 'vacant',
        newStatus: 'occupied',
        confidenceScore: 0.98,
        timestamp: new Date().toISOString(),
        cameraId: sp.cctvCameraId,
      };
      this.broadcast(event);
    }
  }

  private broadcast(event: SpotDetectionEvent): void {
    this.listeners.forEach((fn) => {
      try {
        fn(event);
      } catch (err) {
        console.error('Error in CCTV detector listener:', err);
      }
    });
  }
}

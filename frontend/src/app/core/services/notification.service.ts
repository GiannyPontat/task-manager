import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/api/notifications';

  notifications = signal<Notification[]>([]);
  unreadCount   = signal<number>(0);

  private pollSub: Subscription | null = null;

  startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = interval(30_000).pipe(
      startWith(0),
      switchMap(() => this.http.get<Notification[]>(this.BASE))
    ).subscribe(list => {
      this.notifications.set(list);
      this.unreadCount.set(list.filter(n => !n.read).length);
    });
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  markAsRead(id: number) {
    return this.http.patch<Notification>(`${this.BASE}/${id}/read`, {});
  }
}

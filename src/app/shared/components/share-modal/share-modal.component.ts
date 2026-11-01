import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, X, Users, Link2, Copy, Trash2, Globe } from 'lucide-angular';
import { FileService } from '../../../core/services/file.service';
import { ToastService } from '../../../core/services/toast.service';
import { FileShare, SharePermission } from '../../../core/models/share.model';
import { ShareLink } from '../../../core/models/share-link.model';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (fileService.isShareModalOpen() && fileService.activeShareFile(); as file) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1410]/50 backdrop-blur-sm animate-fade-in">
        <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-7 border border-stone-100 animate-scale-up">
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 class="text-xl font-bold text-stone-900">Share "{{ file.originalName }}"</h3>
              <p class="text-sm text-stone-500 mt-0.5">Control who can view or download this file</p>
            </div>
            <button
              (click)="fileService.closeShareModal()"
              class="text-stone-400 hover:text-stone-600 rounded-xl p-1.5 transition-colors"
            >
              <lucide-icon [img]="X" class="w-5 h-5" [strokeWidth]="2"></lucide-icon>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-stone-100 mt-5">
            <button
              type="button"
              (click)="activeTab.set('people')"
              [class.text-brownblack]="activeTab() === 'people'"
              [class.border-brownblack]="activeTab() === 'people'"
              [class.border-transparent]="activeTab() !== 'people'"
              [class.text-stone-400]="activeTab() !== 'people'"
              class="pb-3.5 px-4 font-bold text-[15px] border-b-2 transition-colors flex items-center gap-2"
            >
              <lucide-icon [img]="Users" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
              <span>Invite People</span>
              <span class="text-xs py-0.5 px-2 bg-stone-100 rounded-full text-stone-600 font-semibold">
                {{ shares().length }}
              </span>
            </button>
            <button
              type="button"
              (click)="activeTab.set('link')"
              [class.text-brownblack]="activeTab() === 'link'"
              [class.border-brownblack]="activeTab() === 'link'"
              [class.border-transparent]="activeTab() !== 'link'"
              [class.text-stone-400]="activeTab() !== 'link'"
              class="pb-3.5 px-4 font-bold text-[15px] border-b-2 transition-colors flex items-center gap-2"
            >
              <lucide-icon [img]="Link2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
              <span>Public Link</span>
              @if (activeShareLink()) {
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              }
            </button>
          </div>

          <!-- Tab 1: Invite People -->
          @if (activeTab() === 'people') {
            <div class="mt-5">
              <!-- Add person input -->
              <div class="flex gap-2.5">
                <input
                  type="email"
                  [(ngModel)]="inviteEmail"
                  placeholder="Enter email address..."
                  class="flex-1 px-4 py-2.5 rounded-2xl border border-stone-200 text-sm focus:outline-none focus:border-brownblack transition-colors"
                />

                <select
                  [(ngModel)]="invitePermission"
                  class="px-3 py-2.5 rounded-2xl border border-stone-200 text-sm font-semibold bg-white text-stone-700 focus:outline-none focus:border-brownblack"
                >
                  <option value="VIEW">Can view</option>
                  <option value="DOWNLOAD">Can download</option>
                </select>

                <button
                  type="button"
                  [disabled]="!inviteEmail"
                  (click)="sendInvite(file.id)"
                  class="px-5 py-2.5 bg-brownblack hover:bg-brownblack-800 text-white text-sm font-semibold rounded-2xl transition-all disabled:opacity-40"
                >
                  Share
                </button>
              </div>

              <!-- Shared with list -->
              <div class="mt-6">
                <p class="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  People with access
                </p>

                <div class="divide-y divide-stone-100 max-h-60 overflow-y-auto">
                  <!-- Owner item -->
                  <div class="py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-brownblack text-white font-bold text-xs flex items-center justify-center">
                        ME
                      </div>
                      <div>
                        <p class="text-[15px] font-bold text-stone-900">You (Owner)</p>
                        <p class="text-xs text-stone-400">Full ownership</p>
                      </div>
                    </div>
                    <span class="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                      Owner
                    </span>
                  </div>

                  <!-- Invited users -->
                  @for (share of shares(); track share.id) {
                    <div class="py-3 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
                          {{ share.sharedWithUser?.fullName?.substring(0, 2)?.toUpperCase() || 'US' }}
                        </div>
                        <div>
                          <p class="text-[15px] font-bold text-stone-900">
                            {{ share.sharedWithUser?.fullName || share.sharedWithUser?.email }}
                          </p>
                          <p class="text-xs text-stone-400">{{ share.sharedWithUser?.email }}</p>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <select
                          [ngModel]="share.permission"
                          (ngModelChange)="changePermission(share.id, $event)"
                          class="text-xs border border-stone-200 rounded-xl py-1.5 px-2.5 font-semibold bg-white text-stone-700"
                        >
                          <option value="VIEW">Can view</option>
                          <option value="DOWNLOAD">Can download</option>
                        </select>

                        <button
                          type="button"
                          (click)="removeShare(share.id)"
                          title="Revoke access"
                          class="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                        >
                          <lucide-icon [img]="Trash2" class="w-4 h-4" [strokeWidth]="2"></lucide-icon>
                        </button>
                      </div>
                    </div>
                  } @empty {
                    <p class="py-5 text-sm text-stone-400 text-center">
                      Not shared with anyone yet. Enter an email above to grant access.
                    </p>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Tab 2: Public Share Link -->
          @if (activeTab() === 'link') {
            <div class="mt-5">
              @if (activeShareLink(); as link) {
                <!-- Active Link Card -->
                <div class="p-5 bg-emerald-50/70 border border-emerald-200 rounded-3xl">
                  <div class="flex items-center justify-between mb-2">
                    <span class="inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Public Link Active
                    </span>

                    @if (link.expiresAt) {
                      <span class="text-xs text-emerald-700 font-semibold">
                        Expires: {{ link.expiresAt | date:'mediumDate' }}
                      </span>
                    } @else {
                      <span class="text-xs text-emerald-700 font-semibold">No expiration</span>
                    }
                  </div>

                  <div class="flex gap-2.5 mt-3.5">
                    <input
                      type="text"
                      readonly
                      [value]="link.publicUrl"
                      class="flex-1 text-xs bg-white border border-emerald-200 rounded-2xl px-3.5 py-2.5 text-stone-700 select-all font-mono"
                    />
                    <button
                      type="button"
                      (click)="copyLink(link.publicUrl!)"
                      class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
                    >
                      <lucide-icon [img]="Copy" class="w-3.5 h-3.5" [strokeWidth]="2"></lucide-icon>
                      <span>Copy Link</span>
                    </button>
                  </div>

                  <div class="mt-3.5 flex justify-end">
                    <button
                      type="button"
                      (click)="revokeLink(link.id)"
                      class="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline"
                    >
                      Disable this link
                    </button>
                  </div>
                </div>
              } @else {
                <!-- Generate Link Form -->
                <div class="p-6 border border-stone-200 rounded-3xl bg-stone-50 text-center">
                  <div class="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3.5">
                    <lucide-icon [img]="Globe" class="w-7 h-7" [strokeWidth]="2"></lucide-icon>
                  </div>
                  <h4 class="text-base font-bold text-stone-900">Anyone with the link can view & download</h4>
                  <p class="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
                    Generate an encrypted, cryptographically secure public URL for this file.
                  </p>

                  <div class="mt-4.5 flex items-center justify-center gap-2.5">
                    <label class="text-xs font-bold text-stone-600">Link expiration:</label>
                    <select
                      [(ngModel)]="expirationHours"
                      class="text-xs border border-stone-200 rounded-xl py-2 px-3 bg-white text-stone-700 font-medium"
                    >
                      <option [value]="24">24 hours</option>
                      <option [value]="168">7 days</option>
                      <option [value]="720">30 days</option>
                      <option [value]="0">Never expires</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    (click)="generateLink(file.id)"
                    class="mt-5 px-6 py-2.5 bg-brownblack hover:bg-brownblack-800 text-white text-sm font-semibold rounded-2xl transition-all shadow-sm"
                  >
                    Generate Public Link
                  </button>
                </div>
              }
            </div>
          }

          <!-- Footer -->
          <div class="mt-7 flex justify-end">
            <button
              type="button"
              (click)="fileService.closeShareModal()"
              class="px-5 py-2.5 border border-stone-200 rounded-2xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ShareModalComponent {
  readonly fileService = inject(FileService);
  readonly toast = inject(ToastService);
  readonly X = X;
  readonly Users = Users;
  readonly Link2 = Link2;
  readonly Copy = Copy;
  readonly Trash2 = Trash2;
  readonly Globe = Globe;

  activeTab = signal<'people' | 'link'>('people');
  inviteEmail = '';
  invitePermission: SharePermission = 'VIEW';
  expirationHours = 168; // 7 days

  shares = signal<FileShare[]>([]);
  activeShareLink = signal<ShareLink | null>(null);

  constructor() {
    effect(() => {
      const file = this.fileService.activeShareFile();
      if (file) {
        this.loadShares(file.id);
        this.loadLinks(file.id);
      }
    });
  }

  async loadShares(fileId: number) {
    const list = await this.fileService.getFileShares(fileId);
    this.shares.set(list);
  }

  async loadLinks(fileId: number) {
    const links = await this.fileService.getShareLinks(fileId);
    const active = links.find((l) => l.isActive);
    this.activeShareLink.set(active || null);
  }

  async sendInvite(fileId: number) {
    if (!this.inviteEmail) return;

    await this.fileService.shareFileWithEmail(fileId, this.inviteEmail, this.invitePermission);
    this.inviteEmail = '';
    await this.loadShares(fileId);
  }

  async changePermission(shareId: number, perm: SharePermission) {
    const file = this.fileService.activeShareFile();
    await this.fileService.updateSharePermission(shareId, perm, file?.id);
    if (file) await this.loadShares(file.id);
  }

  async removeShare(shareId: number) {
    const file = this.fileService.activeShareFile();
    await this.fileService.revokeShare(shareId, file?.id);
    if (file) await this.loadShares(file.id);
  }

  async generateLink(fileId: number) {
    const hours = this.expirationHours > 0 ? this.expirationHours : undefined;
    const link = await this.fileService.createShareLink(fileId, hours);
    this.activeShareLink.set(link);
  }

  async revokeLink(linkId: number) {
    const file = this.fileService.activeShareFile();
    await this.fileService.revokeShareLink(linkId, file?.id);
    this.activeShareLink.set(null);
  }

  copyLink(url: string) {
    navigator.clipboard.writeText(url);
    this.toast.success('Link copied to clipboard!');
  }
}

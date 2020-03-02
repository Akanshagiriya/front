import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  FileUploadComponent,
  FileUploadSelectEvent,
} from '../../../../common/components/file-upload/file-upload.component';
import { ButtonComponentAction } from '../../../../common/components/button-v2/button.component';

@Component({
  selector: 'm-composer__toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'toolbar.component.html',
})
export class ToolbarComponent {
  @Input() hasAttachment: any;

  @Input() canPost: boolean = true;

  @Input() inProgress: boolean = false;

  @Output('onAttachmentSelect') onAttachmentSelectEmitter: EventEmitter<
    FileUploadSelectEvent
  > = new EventEmitter<FileUploadSelectEvent>();

  @Output('onDeleteAttachment') onDeleteAttachmentEmitter: EventEmitter<
    void
  > = new EventEmitter<void>();

  @Output('onPost') onPostEmitter: EventEmitter<
    ButtonComponentAction
  > = new EventEmitter<ButtonComponentAction>();

  @ViewChild('fileUploadComponent', { static: false })
  fileUploadComponent: FileUploadComponent;

  onAttachmentSelect(file: FileUploadSelectEvent): void {
    this.onAttachmentSelectEmitter.emit(file);
  }

  onDeleteAttachmentClick(event?: MouseEvent): void {
    if (this.fileUploadComponent) {
      this.fileUploadComponent.reset();
    }

    this.onDeleteAttachmentEmitter.emit();
  }

  onNsfwClick(event?: MouseEvent): void {
    // TODO: NSFW popup
    // TODO: Spec test
  }

  onMonetizationClick(event?: MouseEvent): void {
    // TODO: Monetization popup
    // TODO: Spec test
  }

  onTagsClick(event?: MouseEvent): void {
    // TODO: Tags popup
    // TODO: Spec test
  }

  onPost(buttonComponentAction: ButtonComponentAction): void {
    this.onPostEmitter.emit(buttonComponentAction);
  }

  onSchedulerClick(event?: MouseEvent): void {
    // TODO: Scheduler popup
    // TODO: Spec test
  }
}

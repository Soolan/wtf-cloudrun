import {
  AfterViewChecked, Component, ElementRef,
  inject, Input, OnInit, ViewChild, TemplateRef, EventEmitter, Output
} from '@angular/core';
import {Discussion, Entity, TicketTimeline} from '@shared/interfaces';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {AuthService, CrudService, FunctionsService} from '@shared/services';
import {DISCUSSIONS} from '@shared/constants';
import {CommonModule, DatePipe, NgClass, NgStyle} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton, MatMiniFabButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {MatTooltip} from '@angular/material/tooltip';
import {BreakpointObserver} from '@angular/cdk/layout';
import {TicketEmoji} from '@shared/enums';
import {TicketTimelineComponent} from '@shared/components/ticket-timeline/ticket-timeline.component';
import {take} from "rxjs";

@Component({
  selector: 'lib-discussions',
  imports: [
    CommonModule,
    DatePipe,
    MatDivider,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatMiniFabButton,
    MatSuffix,
    MatTooltip,
    ReactiveFormsModule,
    NgStyle,
    NgClass,
    TicketTimelineComponent
  ],
  templateUrl: './discussions.component.html',
  standalone: true,
  styleUrl: './discussions.component.scss'
})
export class DiscussionsComponent implements OnInit, AfterViewChecked {
  @Input() path!: string;
  @Input() assignedTo?: Entity;
  @Input() maximized = false;
  @Input() aiPersona: Entity = {  // Default value
    role: 'ai-assistant',
    name: 'Lola',
    avatar: 'assets/images/team/gotta-go-ooooh-surfing.png'
  };
  @Input() context?: string;
  @Input() flowName = 'chatWithUser';
  @Input() showTimeline = true;

  @Input() showDefaultTimeline = true;
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @Input() customTimelineTemplate: TemplateRef<any> | undefined;
  @Output() messageSubmitted = new EventEmitter<Discussion>();

  public breakpoint = inject(BreakpointObserver);

  // Array to hold discussions
  discussions: Discussion[] = [];
  discussionsGroupedByDate: { date: string, discussions: Discussion[] }[] = [];

  // Input for new message
  messageInput = new FormControl('');

  currentUserEntity?: Entity;
  events: TicketTimeline[] = [];

  toggleTimeline = false;

  private crud = inject(CrudService);
  private auth = inject(AuthService);
  private functions = inject(FunctionsService);

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnInit(): void {
    this.auth.user$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.currentUserEntity = {
          role: user.uid,
          name: user.displayName || user.email || 'User',
          avatar: user.photoURL || 'assets/images/team/default-avatar.png'
        };
      }
    });

    const query = {...DISCUSSIONS};
    // query.path = this.path;
    // this.crud.getDocs(query, false, true).then(data => {
    //   this.discussions = data as Discussion[];
    //   if (!this.discussions) return;
    //   this.groupDiscussionsByDate();
    //   this.updateHistory();
    // });



    this.groupDiscussionsByDate();
    if (this.showTimeline && this.showDefaultTimeline) {
      this.updateTimeline();
    }
  }

  // Method to scroll to the bottom of the chat container
  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error(err);
    }
  }

  updateTimeline() {
    if (!this.discussions || this.discussions.length === 0) {
      this.events = [];
      return;
    }
    // Add the start circle before scanning
    this.events = [{event: 'start', timestamp: this.discussions[0].timestamp}];
    const emojis = Object.values(TicketEmoji);
    this.discussions.forEach(discussion => {
      const contents = discussion.contents;
      const timestamp = discussion.timestamp;
      emojis.forEach(emoji => {
        if (contents.includes(emoji)) this.events.push({event: emoji, timestamp});
      });
      // Approval means we can add the end circle. So we do it manually
      if (contents.includes(TicketEmoji.Approval)) this.events.push({event: 'end', timestamp});
    });
  }

  sendMessage(event?: Event) {
    event?.preventDefault();

    if (this.messageInput.value?.trim() && this.currentUserEntity) {
      // Add message to discussions
      const newMessage: Discussion = {
        author: this.currentUserEntity,
        timestamp: Date.now(),
        contents: this.messageInput.value
      };

      this.messageSubmitted.emit(newMessage);

      // Clear the input field
      this.messageInput.reset();
    }
  }

  notify() {
    // Logic to send notifications to both creator and assignee
  }

  addEmoji() {
    // Logic to add emoji picker
    this.messageInput.setValue(this.messageInput.value + '😊'); // Example of adding emoji
  }

  // Function to group discussions by date
  groupDiscussionsByDate() {
    const grouped = this.discussions.reduce((acc: any, discussion) => {
      const date = new Date(discussion.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(discussion);
      return acc;
    }, {});

    // Convert the object to an array for easier rendering
    this.discussionsGroupedByDate = Object.keys(grouped).map(date => ({
      date: date,
      discussions: grouped[date]
    }));
  }

  protected readonly Math = Math;
}

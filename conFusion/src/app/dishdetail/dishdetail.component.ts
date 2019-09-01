import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;

  errMsg: string;

  commentForm: FormGroup;
  comment: Comment;
  @ViewChild('fform', {static: false}) feedbackFormDirective;

  dishCopy: Dish;

  formErrors = {
    'author' : '',
    'comment' : ''
  };

  validationMessages = {
    'author' : {
      'required' : 'Name is required',
      'minlength' : 'Name must be atleast 2 characters',
      'maxlength' : 'Name can not be more 25 characters'
    },
    'comment' : {
      'required' : 'Comment is required',
      'minlength' : 'Comment must be atleast 2 characters',
      'maxlength' : 'Comment can not be more 25 characters'
    }
  };
  
  constructor(private dishService: DishService, 
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) {
      this.createForm();
    }

  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.dishCopy = dish; this.setPrevNext(dish.id); },
    errMsg => this.errMsg = <any>errMsg);
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      rating: [5, Validators.required],
      comment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]]
    });

    this.commentForm.valueChanges.subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); //(re)set form validations
  }

  goBack() {
      this.location.back();
  }

  onValueChanged(data? : any) {
    if (!this.commentForm) return;

    const form = this.commentForm;

    for (const field in this.commentForm) {
      if (this.formErrors.hasOwnProperty(field)) {
        // Clear previous error (if any)
        this.formErrors[field] = '';
        const control = form.get(field);

        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];

          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();
  
    this.dishCopy.comments.push(this.comment);
    this.dishService.putDish(this.dishCopy)
    .subscribe(dish => {
      this.dish = dish;
      this.dishCopy = dish
    },
    errMsg => {
      this.dish = null; this.dishCopy = null;
      this.errMsg = <any>errMsg;
    });
    this.commentForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
    this.feedbackFormDirective.resetForm();
  }
}

import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article/article.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  providers: [ ArticleService ],
  styleUrls: ['./article.component.sass']
})
export class ArticleComponent implements OnInit {
  article: Article;

  constructor(private articleService: ArticleService) {
    this.articleService.getArticle().subscribe(article => {
      this.article = article;
    });
  }

  ngOnInit() {
  }

}

interface Article {
  userId: number;
  id: number;
  title: string;
  body: string;
}

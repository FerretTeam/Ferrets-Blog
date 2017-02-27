import { Component, OnInit } from '@angular/core';
import * as marked from 'marked';
import highlightjs from 'highlight.js';
import { Article, Comment } from '../../services/article/article';
import { ArticleService } from '../../services/article/article.service';
import { ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.sass']
})
export class EditComponent implements OnInit {
  check: boolean
  param: number
  article: Article;
  data: string;
  comments: Comment[];

  constructor(private articleService: ArticleService, private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.check = false;
    // 设定 marked 的参数
    const renderer = new marked.Renderer();
    renderer.code = (code, language) => {
      const validLang = !!(language && highlightjs.getLanguage(language));
      const highlighted = validLang ? highlightjs.highlight(language, code).value : code;
      return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
    };

    marked.setOptions({ renderer });

    // 尝试读取文章的编号
    this.activatedRoute.params.subscribe(params => {
      this.param = params['id'];
    });
  }

  ngOnInit() {
    if (this.param) {
      // 取回文章
      this.article = this.articleService.getArticle(this.param);
      this.comments = this.article.comments;
      (<HTMLInputElement>document.getElementById('article-title')).value = this.article.title;
      document.getElementById('content-before').innerHTML = this.article.contents;
      document.getElementById('submit-button').innerHTML = '更 新';
    }
  }

  contentChange() {
    this.check = !this.check;
    document.getElementById('content-after').innerHTML = marked(document.getElementById('content-before').innerHTML);
  }

  submit() {
    var title = (<HTMLInputElement>document.getElementById('article-title')).value;
    if ( title == '') {
      console.log('Input title');
    }
    // add article
  }


}
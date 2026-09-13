# Components
Vanilla HTML, no framework or component library. Inline buttons, selects, pills, badges and dialogs. No separately imported components.
```html
  <!-- Modal 1: Persona Diagnosis Quiz Modal -->
  <div class="modal-backdrop" id="quizModal">
    <div class="modal-card">
      <div class="modal-header">
        <h3><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent-purple)"></i> 나만의 축제 성향 진단 퀴즈</h3>
        <button class="btn-close-modal"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="quiz-step-progress" id="quizProgress"></div>
      <div class="quiz-question-title" id="quizQuestionTitle"></div>
      <div class="quiz-options-list" id="quizOptionsList"></div>
    </div>
  </div>

  <!-- Modal 2: Partner Store Benefits Modal -->
  <div class="modal-backdrop" id="storeListModal">
    <div class="modal-card">
      <div class="modal-header">
        <h3 id="storeModalDistrictName">가맹점 혜택 &amp; 스탬프</h3>
        <button class="btn-close-modal"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <p style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:16px;">
        트로이카 연합축제 제휴 협약(10~15% 할인 또는 전용 메뉴 증정) 매장 목록입니다.
      </p>
      <div class="partner-stores-list" id="storeModalList"></div>
    </div>
  </div>


```

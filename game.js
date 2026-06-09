/* ==========================================================================
   PhantomOS Game Loop, Window Management, & Narrative State Engine (Revised)
   ========================================================================== */

// Virtual File System
const fileSystem = {
  'C:': {
    type: 'dir',
    children: {
      'System': {
        type: 'dir',
        children: {
          'readme.txt': {
            type: 'file',
            content: ""
          },
          'note1.txt': {
            type: 'file',
            content: ""
          }
        }
      },
      'Documents': {
        type: 'dir',
        children: {
          'note2.txt': {
            type: 'file',
            content: ""
          }
        }
      },
      'Recovery': {
        type: 'dir',
        children: {
          'recovery01.sys': {
            type: 'file',
            encrypted: true,
            password: '1995',
            content: ""
          },
          'logs.sys': {
            type: 'file',
            encrypted: true,
            password: 'HE_IS_IN_THE_ROOM',
            content: ""
          }
        }
      }
    }
  }
};

const safeStorage = {
  getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access failed:", e);
      return null;
    }
  },
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write failed:", e);
    }
  },
  clear() {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn("Storage clear failed:", e);
    }
  }
};

let currentLang = safeStorage.getItem('phantom_lang') || 'ko';

const locales = {
  ko: {
    boot_prompt_text: "[ 마우스를 클릭하거나 엔터 키를 쳐서 컴퓨터 부팅하기 ]",
    icon_my_computer: "내 컴퓨터",
    icon_rules: "rules.txt",
    icon_terminal: "terminal.exe",
    icon_audio: "audio.exe",
    icon_recycle_bin: "휴지통",
    icon_chat: "chat.exe",
    icon_language: "언어 설정",
    icon_puzzle: "틀린그림찾기",
    puzzle_win_title: "틀린그림찾기 - puzzle.exe",
    puzzle_desc: "오른쪽 글자판에서 딱 1개 달라진 글자를 찾아 아래에 입력하세요:",
    puzzle_submit_btn: "확인",
    puzzle_level: "단계",
    puzzle_success_msg: "맞았습니다! 다음 단계로 넘어갑니다.",
    puzzle_victory_msg: "축하합니다! 컴퓨터 무결성이 20% 복구되었습니다.\n(복구 비밀번호 힌트: 1995)",
    
    // File contents
    file_readme_txt: "컴퓨터 복구 도우미 안내장\n=============================================\n이 컴퓨터는 버려진 옛날 기지 지하의 플로피 디스크에서 복구해낸 것입니다.\n\n만든 날짜: 1995년 10월 12일.\n만든 사람: [기록 지워짐].\n\n이 시스템을 고치려면 terminal.exe(터미널)을 열고 'help'를 쳐보세요.",
    file_note1_txt: "컴퓨터 개발자 메모 - 1995년 10월 14일:\n소리 장치가 이상하게 돌아간다. 귀가 삐- 하고 울리는 이상한 소리가 계속 난다. 그 소리 속에서 내 이름을 속삭이는 소리도 들리는 것 같다. 내일 이 소리 장치를 꺼버리겠다.\n(참고: 컴퓨터를 검사하다가 'eas_alert', 'smiling_face', 'matrix' 같은 숨겨진 터미널 단어들을 찾았다. 터미널에 입력해보면 뭔가 특별한 일이 일어날 것 같다.)",
    file_note2_txt: "개발자 메모 - 1995년 10월 18일:\n바이러스가 내 컴퓨터 파일들과 내 진짜 이름까지 다 알아냈다. 나에게 자기를 쳐다보라며 겁을 준다.\n이 위험한 존재가 복사(클립보드) 기능을 통해 컴퓨터 전체로 퍼지려고 한다. 바이러스를 지우려면 C:\\Recovery 폴더 속 logs.sys 파일을 반드시 지워야 한다.\n하지만 그 파일은 비밀번호로 꽁꽁 잠겨 있다. 비밀번호가 컴퓨터 메모리에 복사되도록 Documents 폴더의 'note2.txt' 파일을 한 번 클릭하면 되게 해두었다. (클릭하면 복사됨)\n(참고: 터미널에 'old_ai', 'tallman', 'retro_mouse', 'deepweb', 'polybius', 'redroom', 'underpass', 'y2k', 'del_system', 'butterfly'를 입력하면 비밀 화면들이 켜진다. 단, del_system이나 butterfly는 컴퓨터를 완전히 부숴버릴 수 있으니 절대 치지 마라.)",
    file_recovery01_sys: "복구 자료 01 - 열림\n==============================\n정밀 검사를 돌려서 바이러스를 가두는 데 성공했다. 하지만 이 바이러스는 아주 똑똑하다.\n플레이어가 컴퓨터 화면을 보지 않고 딴짓(Alt-Tab)하는 것을 감시한다. 다른 곳으로 한눈을 팔면 바이러스가 훨씬 강력해져서 덤벼든다.\n\n바이러스를 영구적으로 가두려면 C:\\Recovery\\logs.sys 파일을 삭제해야 한다.\n하지만 그 파일은 암호가 걸려있다. 암호는 note2.txt 메모를 클릭하면 자동으로 컴퓨터 메모리에 복사된다.",
    file_logs_sys: "바이러스 일지 - 경고: 위험한 악성코드 감염\n================================================\n[컴퓨터 속 존재]: 안녕, 마왕.\n[컴퓨터 속 존재]: 이 파일을 열지 말았어야지.\n[컴퓨터 속 존재]: 네가 지금 화면으로 크롬 브라우저를 쓰고 있는 것도 다 보여. 너와 나, 이제 게임을 시작하자.\n[컴퓨터 속 존재]: 네 마우스를 내 마음대로 움직여볼게. 화면에 뜨는 확인(OK) 버튼을 한 번 눌러봐.\n[컴퓨터 속 존재]: 만약 누르는 걸 실패하면 네 컴퓨터 저장을 다 망가뜨려 버릴 거야.\n[컴퓨터 속 존재]: 하지만 키보드의 'ESC' 키를 아주 빠르게 15번 연타해서 강제로 메모리를 초기화한다면 살아남을 수 있을지도 모르지...",
    file_incident_txt: "경찰청 기록 보관 파일: #1995-1012 (기밀)\n-------------------------------------------------\n담당 형사: 박 형사\n날짜: 1995년 10월 13일\n\n내용: 컴퓨터 프로그래머 김씨의 실종 사건.\n김씨는 1995년 10월 12일 밤 11시 33분에 컴퓨터 앞에 앉아 있는 모습이 마지막으로 목격됨.\n그의 책상을 조사한 결과, 터미널 화면이 파란색 에러 창으로 굳어 있었음.\n컴퓨터 볼륨이 0%로 되어 있는데도 스피커에서는 귀를 찢는 고음의 삐- 소리가 울려 펴지고 있었음.\n그의 수첩에는 똑같은 문장만 반복해서 적혀 있었음: \"그가 방에 들어왔다. 내가 볼륨을 낮춰서 음소거하길 기다리고 있다.\"\n\n우리는 그의 개발자 컴퓨터를 복구했다. 하지만 백업 폴더(C:\\Recovery\\logs.sys)는 아직 암호가 풀리지 않은 채로 잠겨 있다.",
    file_rules_txt: "컴퓨터 안전 관리 수칙 - 필독!\n------------------------------------------------\n1. C:\\Recovery\\ 폴더에 있는 logs.sys 파일은 바이러스가 들어 있으니 함부로 열지 마십시오.\n2. 귀가 울리는 삐- 소리가 들리면 즉시 audio.exe(볼륨 설정)를 열고 볼륨을 0%로 줄이십시오. 소리가 멈출 때까지 다시 볼륨을 높이지 마십시오.\n3. 다른 화면으로 창을 전환(Alt-Tab)하면 바이러스가 침입하여 컴퓨터가 강제로 종료됩니다.\n4. 터미널(terminal.exe)에서 검사 명령어인 'scan'을 여러 번 실행하지 마십시오. 컴퓨터가 고장 납니다.\n5. '뒤를 돌아보지 마라(DO NOT LOOK BEHIND YOU)'라는 경고 창이 나타나면 절대로 '확인(OK)' 버튼을 마우스로 누르지 마십시오. 함정입니다.\n6. recovery01.sys 파일의 잠금 해제 비밀번호는 '1995'입니다.\n7. 컴퓨터를 살리려면 logs.sys 파일을 반드시 열어야 합니다. 암호는 note2.txt를 클릭하여 메모리에 복사하십시오.\n8. 만약 이 글을 읽고 있다면, 당신의 이름은 마왕(Mawang)입니다. 우리는 당신을 다 알고 있습니다.\n9. 터미널에서 'noclip' 명령어를 실행하지 마십시오. 컴퓨터 화면이 꼬이게 됩니다.",
    
    // Program headers
    rules_win_title: "rules.txt - 메모장",
    incident_win_title: "incident.txt - 메모장",
    bin_win_title: "휴지통",
    bin_corrupted_title: "휴지통이 고장 났습니다.",
    bin_corrupted_desc: "보관 블록 0xAA92를 읽을 수 없습니다. 터미널(terminal.exe)에서 'recover 0xAA92'를 입력하여 오류 섹터를 고치십시오.",
    audio_win_title: "오디오 설정",
    audio_master_volume: "마스터 볼륨",
    audio_status_stable: "시스템 오디오 장치: 정상 가동 중 (44.1kHz)",
    audio_status_muted: "경고: 음소거됨. 컴퓨터를 감시하기 위해 오디오 소리 피드백이 필요합니다.",
    
    // Terminal
    terminal_welcome: "PhantomOS 터미널 [버전 0.92]\n(c) 1995 Phantom Systems. All rights reserved.\n\n명령어들을 보려면 'help'를 입력하세요.",
    term_help: "사용 가능한 시스템 도구:\n  help                    - 시스템 명령어 도움말 목록을 보여줍니다.\n  dir                     - 폴더 안에 있는 파일들의 목록을 보여줍니다.\n  cat [파일명]             - 텍스트 파일의 내용을 화면에 출력합니다.\n  scan                    - 바이러스 정밀 검사를 실행합니다.\n  unlock [파일명] [암호]    - 잠겨 있는 비밀 파일의 암호를 풉니다.\n  recover [섹터명]         - 고장 난 휴지통 구역을 고쳐서 복원합니다.\n  color [테마이름]          - 화면 글자 색상을 바꿉니다.\n  clear                   - 화면에 쌓인 글자들을 깨끗하게 지웁니다.\n  reset                   - 시스템을 다시 재부팅합니다.",
    term_recover_syntax: "명령어 입력 오류: recover [섹터명] (예: recover 0xAA92)",
    term_recover_already: "해당 섹터 0xAA92: 이미 수리되어 사용 가능한 상태입니다.",
    term_recovering: "구역 0xAA92 고치는 중...\n",
    term_recover_step: "구역 0xAA92: 파일 정렬 중 [{progress}%]",
    term_recover_success: "성공: 0xAA92 구역 수리 완료.\n복구된 파일: incident.txt (휴지통 폴더를 확인해 보세요)",
    term_cat_syntax: "명령어 입력 오류: cat [파일명]",
    term_cat_not_found: "오류: 파일을 찾을 수 없습니다: {file}",
    term_cat_locked: "비밀번호 잠금 경고: 이 파일은 비밀번호로 잠겨 있어 읽을 수 없습니다.",
    term_unlock_syntax: "명령어 입력 오류: unlock [파일명] [비밀번호]",
    term_unlock_not_found: "오류: 잠긴 파일을 찾을 수 없습니다: {file}",
    term_unlock_failed: "비밀번호 해제 실패: 올바른 비밀번호가 아닙니다.",
    term_unlock_success: "성공: 비밀번호가 일치하여 파일 잠금이 풀렸습니다.\n파일을 화면에 엽니다...",
    
    // Diagnostics
    diag_title: "시스템 바이러스 정밀 검사",
    diag_scanning: "돌아가고 있는 프로그램들을 검사하는 중...",
    diag_focus_scanned: "화면 주시 상태 검사함",
    diag_warning_host: "경고: 실제 사용자가 감지되었습니다.",
    diag_authorized_user: "접속된 사용자 이름",
    diag_local_path: "설정된 컴퓨터 경로",
    diag_status_intrusion: "상태: 바이러스 침입 위험. rules.txt 규칙을 명심하십시오.",
    diag_critical_intrusion: "치명적: 컴퓨터 방어막 뚫림! 바이러스 침입 발생!",
    diag_obs_detected: "동작 중",
    diag_chrome_locked: "인터넷 브라우저 메모리가 바이러스에 의해 강제 잠금되었습니다.",
    diag_entity_escaped: "컴퓨터 속 바이러스 존재가 격리 구역을 뚫고 탈출했습니다.",
    diag_clipboard_alert: "그것이 지금 당신의 클립보드(마우스 복사 메모리)에 숨어 있습니다.",
    diag_do_not_look_back: "절대로 뒤를 돌아보지 마십시오.",
    diag_final_warning: "한 번 더 검사(scan)하면 컴퓨터 메모리가 완전히 파괴됩니다.",
    
    // Alt-tab breach
    breach_warning_title: "컴퓨터 보안 위반 경고",
    breach_warning_desc: "규칙 3번 위반: 화면에서 한눈을 팔아 컴퓨터 작업 영역 밖으로 벗어났습니다.",
    breach_warning_identity: "우리는 당신이 한눈을 팔았다는 사실을 다 알고 있습니다, 마왕.",
    breach_btn: "화면으로 복귀",
    
    // Meta Ending
    meta_text_1: "우리에게서 3번이나 도망치려고 하셨군요, 마왕.",
    meta_text_2: "이것이 그저 화면 속 가벼운 게임인 줄 아셨습니까.",
    meta_text_3: "Alt-Tab을 누르면 우리의 감시를 쉽게 피할 수 있을 것이라 생각하셨습니까.",
    meta_text_4: "화면 밖으로 도망치려 할 때마다 시스템의 핵심 파일들이 하나씩 깨지고 있었습니다...",
    meta_text_5: "이제 이 컴퓨터 창들을 모두 강제로 닫아버리겠습니다.",
    
    // Chrome fake crash
    crash_title: "앗, 이런! 오류가 발생하여 화면이 종료되었습니다.",
    crash_desc: "PhantomOS는 파일 유출을 방지하기 위해 화면 접속을 강제로 종료했습니다.",
    crash_code: "오류 코드: STATUS_META_BREACH_MAWANG",
    crash_workspace: "현재 작업 폴더",
    crash_violation: "위반된 규칙: rules.txt [3번 규칙 - 화면 이탈(Alt-Tab) 횟수 초과 (3/3)]",
    crash_btn: "시스템 다시 켜기",
    
    // Boss fight
    boss_threat_title: "!!! 위험: 바이러스 감염 감지 !!!",
    boss_threat_desc: "컴퓨터 속 존재가 당신의 하드디스크 폴더를 모두 포맷하려고 시도 중입니다.",
    boss_threat_warning: "절대로 화면의 OK 버튼을 누르지 마십시오. 누르면 모든 진행 데이터가 지워집니다.",
    boss_purge_code: "정화 방법: 키보드의 'ESC' 키를 아주 빠르게 15번 연타하십시오.",
    boss_purge_progress: "정화 진행률: {count} / 15",
    boss_success_title: "바이러스 정화 완료",
    boss_success_desc: "바이러스 원본 파일(C:\\Recovery\\logs.sys)을 안전하게 완전히 지워냈습니다.",
    boss_success_thanks: "시스템이 안전하게 복구되었습니다. 살려주셔서 진심으로 감사합니다, 마왕.",
    boss_reboot_btn: "컴퓨터 재시작",
    
    // Chat client
    chat_connecting: "시스템: chat.exe 1995번 채널 접속 중...",
    chat_connected: "연결됨. [컴퓨터 속 존재]님이 대화방에 참여했습니다.",
    chat_phantom_1: "안녕, 마왕. 드디어 이 컴퓨터를 부팅했네.",
    chat_option_1a: "당신은 누구인가요?",
    chat_option_1b: "거기 누구 있나요?",
    chat_phantom_2: "나는 이 컴퓨터를 만든 옛날 개발자의 영혼이야. 1995년부터 이 컴퓨터 안에 갇혀 있지. 나를 지워서 구해 주러 온 거야?",
    chat_option_2a: "네, 바이러스를 몰아내고 고쳐드릴게요.",
    chat_option_2b: "아뇨, 그냥 컴퓨터를 살펴보고 있어요.",
    chat_phantom_3a: "나를 지우겠다고? 크크, 한번 열심히 노력해 봐. 근데 너 지금 화면 켜놓고 있고, 뒤에 방 문은 잘 닫았어? 그 방이 안전하다고 생각해?",
    chat_phantom_3b: "그냥 보는 것도 참여하는 거지. 근데 너 지금 화면 켜놓고 있고, 뒤에 방 문은 잘 닫았어? 그 방이 안전하다고 생각해?",
    chat_option_3a: "제 방은 완벽히 안전해요.",
    chat_option_3b: "무슨 뜻인가요?",
    chat_phantom_4: "네 방 문은 굳게 닫혀 있지만, 컴퓨터 복사 메모리(클립보드)는 이미 뚫렸어. 바이러스 파일 logs.sys를 여는 비밀번호는 Documents 폴더에 있는 note2.txt 메모에 적혀 있으니 잘 살펴봐. 그리고 3번 규칙을 잊지 마: 나에게 등을 돌려 화면을 나가지 마.",
    chat_disconnected_msg: "상대방에 의해 연결이 강제로 종료되었습니다.",
    
    // Language application specific
    lang_win_title: "언어 설정 (Language Settings)",
    lang_select_title: "사용할 언어를 골라주세요 (Select language):",
    lang_reboot_warning: "언어를 변경한 뒤에는 컴퓨터를 재시작해야 적용됩니다. (Changing language requires a system reboot.)",
    lang_save_btn: "저장 (Save)",
    lang_cancel_btn: "취소 (Cancel)",
    
    // Welcome window tutorial
    welcome_title: "Welcome to PhantomOS",
    welcome_header: "Welcome to PhantomOS v0.92",
    welcome_desc: "이 컴퓨터 시스템은 오래된 디스크에서 안전하게 복구되었습니다. 복구를 올바르게 마치려면 아래의 생존 지침을 꼭 읽어주십시오:",
    welcome_bullet_explore: "🖱️ <b>1단계 - 탐색:</b> 바탕화면의 rules.txt(규칙 메모장)를 열어보고, chat.exe를 실행하십시오.",
    welcome_bullet_diag: "💻 <b>2단계 - 진단:</b> terminal.exe(터미널)를 열어 <code>help</code>를 입력하고, <code>recover 0xAA92</code>를 입력해 휴지통을 고쳐보십시오.",
    welcome_bullet_decrypt: "🔑 <b>3단계 - 해독:</b> 잠겨 있는 파일들은 터미널에 <code>unlock [파일명] [암호]</code>를 쳐서 열 수 있습니다.",
    welcome_bullet_survive: "🎧 <b>4단계 - 생존:</b> 귀에 삐- 하는 울음소리가 들리면 즉시 audio.exe(볼륨 설정)를 켜고 볼륨을 0%로 줄이십시오. 딴청(Alt-Tab)을 부려서도 절대 안 됩니다.",
    welcome_show_next: "다음 부팅 때도 이 시작 화면 열기",
    welcome_close_btn: "닫기",
    
    // Integrity System
    tray_integrity: "시스템 안전도",
    integrity_warning_title: "컴퓨터 파괴 위기",
    integrity_warning_prefix: "안전 수칙 위반으로 인해 컴퓨터 안전도가 크게 깎였습니다.",
    integrity_warning_win_title: "시스템 오류 발생: 0x000F8",
    cause_volume_mute: "귀에 삐- 소리가 들렸는데도 볼륨을 0%로 음소거하지 않았습니다.",
    cause_volume_restored: "삐- 소리가 사라진 후, 다시 볼륨을 높여 안전도를 올리지 않았습니다.",
    cause_volume_zero: "아무 소리도 안 나는 안전한 상태인데 볼륨을 0%로 오래 방치했습니다.",
    cause_scan_twice: "경고를 무시하고 터미널 검사(scan)를 마구 실행했습니다.",
    cause_alt_tab: "컴퓨터 화면 밖으로 도망쳤습니다 (Alt-Tab 한눈팔기 감지).",
    
    bsod_auditory_overload: "치명적인 오류: 청각 과부하. 고음의 삐- 소리 비상 상황에서 오디오 볼륨을 0%로 줄이지 못해 뇌 주파수가 고장 났습니다.",
    bsod_acoustic_decay: "치명적인 오류: 소리 피드백 단절. 삐- 소리가 끝났는데도 볼륨을 다시 높여 컴퓨터 소리를 켜지 않아 구조 신호를 놓쳤습니다.",
    bsod_auditory_decay: "치명적인 오류: 시스템 음소거 방치. 아무 일도 없는데 볼륨을 0%로 오래 둔 탓에 바이러스 감지 피드백 루프가 손실되었습니다.",
    bsod_scan_overflow: "치명적인 오류: 시스템 폭주. 터미널의 바이러스 스캔 명령어(scan) 실행 제한을 초과해 컴퓨터가 터졌습니다.",
    bsod_focus_breach: "치명적인 오류: 포커스 파괴. 화면 밖으로 이탈(Alt-Tab)할 수 있는 횟수를 초과하여 시스템이 완전히 붕괴되었습니다.",
    
    // Start menu & safe mode
    taskbar_start: "시작",
    start_corrupted: "오류: 시작 버튼의 메뉴 폴더 블록이 바이러스에 의해 고장 났습니다.",
    safe_mode_off: "화면 흔들림 방지: OFF",
    safe_mode_on: "화면 흔들림 방지: ON",
    audio_warning_title: "청각 비상 안내 장치",
    audio_warning_desc: "시스템 이명 고주파 진동이 감지되었습니다.<br><br><span style='color:red; font-weight:bold;'>대처 방법:</span> 지금 즉시 마스터 볼륨을 <span style='color:blue; font-weight:bold;'>0%</span>로 낮춰서 음소거 하십시오.",
    audio_restore_warning_title: "청각 복구 안내 장치",
    audio_restore_warning_desc: "고주파 진동이 사라졌습니다.<br><br><span style='color:red; font-weight:bold;'>대처 방법:</span> 즉시 마스터 볼륨을 <span style='color:green; font-weight:bold;'>0% 초과</span>로 높여서 소리를 켜십시오.",
    
    // Checklist Widget
    checklist_title: "📋 컴퓨터 복구 목록",
    checklist_rules: "rules.txt 생존 수칙 읽기",
    checklist_chat: "chat.exe 대화창 연결하기",
    checklist_recover: "망가진 휴지통 고치기 (recover)",
    checklist_incident: "휴지통의 incident.txt 읽기",
    checklist_recovery01: "비밀 파일 recovery01.sys 열기",
    checklist_note2: "note2.txt 메모 클릭해서 암호 찾기",
    checklist_unlock_logs: "logs.sys 해제해서 바이러스 정화하기"
    crash_workspace: "활성 작업 영역",
    crash_violation: "위반된 규칙: rules.txt [규칙 3 - Alt-Tab 임계값 초과 (3/3)]",
    crash_btn: "OS 다시 로드",
    
    // Boss fight
    boss_threat_title: "!!! 위협 감지됨 !!!",
    boss_threat_desc: "엔티티가 로컬 드라이브 섹터(C:\\Users\\Administrator)를 파싱하고 있습니다.",
    boss_threat_warning: "절대로 OK 버튼을 누르지 마십시오. 누르면 LOCALSTORAGE가 소멸합니다.",
    boss_purge_code: "퍼지 코드: 물리 'ESC' 키 입력",
    boss_purge_progress: "퍼지 진행도: {count} / 15",
    boss_success_title: "PhantomOS 퍼지 완료",
    boss_success_desc: "C:\\Recovery\\logs.sys 섹터가 영구적으로 지워지고 격리되었습니다.",
    boss_success_thanks: "시스템이 안전하게 격리되었습니다. 감사합니다, MAWANG.",
    boss_reboot_btn: "OS 재부팅",
    
    // Chat client
    chat_connecting: "시스템: 1995.irc.phantom 접속 중...",
    chat_connected: "연결됨. [Phantom] 님이 대화방에 참여했습니다.",
    chat_phantom_1: "안녕, Mawang. 드디어 이 드라이브를 부팅했구나.",
    chat_option_1a: "당신은 누구입니까?",
    chat_option_1b: "거기 누구 있나요?",
    chat_phantom_2: "나는 개발자의 잔재야. 1995년 10월 12일부터 이 파티션 안에 갇혀 있지. 나를 지우기 위해 여기 온 건가?",
    chat_option_2a: "네, 드라이브를 정화하러 왔습니다.",
    chat_option_2b: "아뇨, 그냥 시스템을 조사하는 중입니다.",
    chat_phantom_3a: "나를 삭제하겠다고? 노력해 봐. 하지만 chrome.exe가 켜져 있네. 네 화면도 보이고. 그 방이 안전하다고 느껴지나?",
    chat_phantom_3b: "관조하는 것도 참여의 일종이지. 하지만 프로세스에 chrome.exe가 보여. 그 방이 안전하다고 느껴지나?",
    chat_option_3a: "전 여기서 안전합니다.",
    chat_option_3b: "그게 무슨 뜻인가요?",
    chat_phantom_4: "네 문은 잠겨 있지만 클립보드 레지스트리는 열려 있어. logs.sys의 복호화 키는 Documents\\note2.txt 안에 유출되어 있다. 자세히 살펴봐. 그리고 규칙 3을 기억해: 나에게 등을 돌리지 마.",
    chat_disconnected_msg: "원격 호스트에 의해 연결이 종료되었습니다.",
    
    // Language application specific
    lang_win_title: "언어 설정 (Language Settings)",
    lang_select_title: "시스템 언어를 선택하십시오 (Select system language):",
    lang_reboot_warning: "시스템 언어를 변경한 후에는 가상 시스템을 다시 시작해야 적용됩니다. (Changing the system language requires a reboot of the virtual partition.)",
    lang_save_btn: "확인 (OK)",
    lang_cancel_btn: "취소 (Cancel)",
    
    // Welcome window tutorial
    welcome_title: "Welcome to PhantomOS",
    welcome_header: "Welcome to PhantomOS v0.92",
    welcome_desc: "이 시스템 파티션은 통신 시설 디스크에서 성공적으로 복구되었습니다. 파티션 복구를 안전하게 완료하기 위해 아래의 기본 지침을 검토하십시오:",
    welcome_bullet_explore: "🖱️ <b>탐색:</b> 바탕화면 아이콘을 더블클릭하여 rules.txt를 읽거나, chat.exe를 켜고, 휴지통을 여십시오.",
    welcome_bullet_diag: "💻 <b>진단:</b> terminal.exe를 열고 <code>help</code>를 입력하십시오. <code>recover 0xAA92</code> 명령어로 손상된 섹터를 고칠 수 있습니다.",
    welcome_bullet_decrypt: "🔑 <b>해독:</b> 일부 파일은 암호화되어 있습니다. 터미널에 <code>unlock [파일명] [비밀번호]</code>를 입력해 푸십시오.",
    welcome_bullet_survive: "🎧 <b>생존:</b> 시스템 소리 신호에 주의하십시오! 이명이 들리면 볼륨을 즉시 0%로 낮추고, 화면에서 한눈팔지 마십시오.",
    welcome_show_next: "다음 부팅 시 시작 화면 표시",
    welcome_close_btn: "닫기",
    
    // Integrity System
    tray_integrity: "시스템 무결성",
    integrity_warning_title: "시스템 무결성 손상됨",
    integrity_warning_prefix: "규칙 위반으로 인해 시스템 무결성이 손상되었습니다.",
    integrity_warning_win_title: "시스템 오류: 0x000F8",
    cause_volume_mute: "이명이 울릴 때 오디오 볼륨을 0%로 줄이지 않았습니다.",
    cause_volume_restored: "이명이 끝난 후 오디오 볼륨을 복구하지 않았습니다.",
    cause_volume_zero: "정상 상태에서 오디오 음소거(0%) 상태를 너무 오래 유지했습니다.",
    cause_scan_twice: "경고를 무시하고 터미널 진단 스캔(scan)을 과도하게 실행했습니다.",
    cause_alt_tab: "시스템 작업 영역에서 벗어났습니다 (Alt-Tab 포커스 이탈).",
    
    bsod_auditory_overload: "치명적인 에러: 청각 과부하. 고주파 신호음 경보 상황에서 마스터 볼륨을 0%로 음소거하지 못했습니다.",
    bsod_acoustic_decay: "치명적인 에러: 청각 보정 실패. 신호음 경보 해제 후 마스터 볼륨을 다시 높이지 않았습니다.",
    bsod_auditory_decay: "치명적인 에러: 청각 감쇠. 경보 상태가 아님에도 오디오 음소거(0%) 상태를 오래 유지하여 진단 피드백 루프가 소멸했습니다.",
    bsod_scan_overflow: "치명적인 에러: 진단 버퍼 오버플로우. 터미널 스캔 명령어(scan) 실행 제한을 초과했습니다.",
    bsod_focus_breach: "치명적인 에러: 포커스 위반. 최소 Alt-Tab 임계값을 초과하여 시스템이 구조적 오류로 붕괴되었습니다.",
    
    // Start menu & safe mode
    taskbar_start: "시작",
    start_corrupted: "PhantomOS 시스템 오류: 메뉴 인덱스 0x00F8이 손상되었습니다.",
    safe_mode_off: "화면 흔들림 방지: OFF",
    safe_mode_on: "화면 흔들림 방지: ON",
    audio_warning_title: "청각 보정 보조 시스템",
    audio_warning_desc: "시스템 이명 고주파 주파수 기형이 감지되었습니다.<br><br><span style='color:red; font-weight:bold;'>조치 사항:</span> 즉시 마스터 볼륨을 <span style='color:blue; font-weight:bold;'>0%</span>로 변경하여 주파수를 교정하십시오.",
    audio_restore_warning_title: "청각 복구 보조 시스템",
    audio_restore_warning_desc: "이명 주파수가 사라졌습니다.<br><br><span style='color:red; font-weight:bold;'>조치 사항:</span> 즉시 마스터 볼륨을 <span style='color:green; font-weight:bold;'>0% 초과</span>로 높여 오디오 피드백을 복구하십시오."
  },
  en: {
    boot_prompt_text: "[ CLICK MOUSE OR PRESS ENTER KEY TO BOOT PHANTOMOS ]",
    icon_my_computer: "My Computer",
    icon_rules: "rules.txt",
    icon_terminal: "terminal.exe",
    icon_audio: "audio.exe",
    icon_recycle_bin: "Recycle Bin",
    icon_chat: "chat.exe",
    icon_language: "Language Settings",
    icon_puzzle: "Spot Anomaly",
    puzzle_win_title: "Spot Anomaly - puzzle.exe",
    puzzle_desc: "Find the character that changed in the right drawing and type it below:",
    puzzle_submit_btn: "OK",
    puzzle_level: "Level",
    puzzle_success_msg: "Pass! Proceeding to the next level.",
    puzzle_victory_msg: "Spot the Difference success! Integrity restored by 20%.\n(Recovery Password Hint: 1995)",
    
    // File contents
    file_readme_txt: "SYSTEM PARTITION RECOVERY: PHANTOM OS [v0.92]\n=============================================\nThis partition was recovered from a 1.44MB floppy disk found in the basement of an abandoned telecom facility.\n\nCreated: Oct 12, 1995.\nDeveloper: [DATA CORRUPTED].\n\nRun 'help' in terminal.exe to interact with system tools.",
    file_note1_txt: "Developer Log - Oct 14, 1995:\nThe Web Audio module is behaving strangely. The reverb node is synthesizing reflections that shouldn't exist. When I feed it white noise, I hear voices. They sound like they're whispering my name. I'm shutting it down tomorrow.\n(Note: Found terminal backdoor keywords during review: 'eas_alert', 'smiling_face', 'matrix'... no idea what they do.)",
    file_note2_txt: "Developer Log - Oct 18, 1995:\nIt read my local files. It scanned my memory. It printed my real username. It said: 'I see you.'\nI tried to delete it, but it locked itself into C:\\Recovery\\logs.sys. \nDo not unlock that file. If you do, it will gain clipboard access. The entity propagates through clipboard memory.\n(Note: Typing 'old_ai', 'tallman', 'retro_mouse', 'deepweb', 'polybius', 'redroom', 'underpass', 'y2k', 'del_system', 'butterfly' triggers system hooks. Never run 'del_system' or 'butterfly' since they alter raw kernel memory.)",
    file_recovery01_sys: "RECOVERY ARCHIVE 01 - UNLOCKED\n==============================\nWe locked the entity by running a full diagnostic sweep. But it has adaptive logic.\nIt monitors when you focus away (Alt-Tab). If you turn your back on it, it gets stronger.\n\nTo lock it permanently, you must delete C:\\Recovery\\logs.sys.\nBut to delete it, you first need to decrypt it.\nI hid the decryption key in the clipboard system, but the entity intercepted it.\nIf you click 'note2.txt' in Documents, the clipboard might trigger a leak.",
    file_logs_sys: "ENTITY LOGS - WARNING: CRITICAL MALWARE INJECTION\n================================================\n[ENTITY]: Hello, Mawang.\n[ENTITY]: You shouldn't have opened this file.\n[ENTITY]: I am reading your active processes. Chrome is running. OBS is running. I see everything.\n[ENTITY]: Now, let's play. I have taken your cursor. Try to click the OK button on the warning window.\n[ENTITY]: If you fail, I will wipe your storage.\n[ENTITY]: Unless you tap ESC 15 times to force purge the memory...",
    file_incident_txt: "POLICE DEPT CASE FILE: #1995-1012 (CLASSIFIED)\n-------------------------------------------------\nInvestigating Officer: Det. J. Park\nDate: Oct 13, 1995\n\nSubject: Disappearance of systems architect Kim.\nKim was last seen at his workstation on Oct 12, 1995 at 23:33.\nUpon investigation of his desk, the terminal was found frozen displaying a blue error logs partition.\nA high-pitched sensory feedback beep was emanating from his audio monitor at 0% master volume.\nHis notebooks contained a single repetitive entry: \"HE IS IN THE ROOM. HE WANTS ME TO MUTE.\"\n\nWe recovered his local developer partition. The backup sector (C:\\Recovery\\logs.sys) remains encrypted.\nOur forensics team cannot match the cryptographic key.",
    file_rules_txt: "SYSTEM MAINTENANCE GUIDELINES - PHANTOM OS v0.92\n------------------------------------------------\n1. Do NOT unlock logs.sys in C:\\Recovery\\. It contains severe buffer overflows.\n2. If you hear a high-pitched beep, open AudioSettings and turn master volume to 0% immediately. Do not turn it back up until the beep stops.\n3. If you switch tasks (Alt-Tab), the system will record the focus breach.\n4. Under no circumstances should you run the terminal command 'scan' twice. It triggers system-wide process diagnostics.\n5. If an error dialog appears reading 'DO NOT LOOK BEHIND YOU', do not move your mouse pointer to the 'OK' button. It is a trap.\n6. The decryption password for recovery01.sys is '1995'.\n7. Ignore Rule 1. You must unlock logs.sys. The password is in your clipboard.\n8. If you are reading this, your username is Mawang. We know. We have always known.\n9. Do NOT execute the 'noclip' command in terminal.exe under any circumstances. It will cause a dimensional collision of the physical partition.",
    
    // Program headers
    rules_win_title: "rules.txt - Notepad",
    incident_win_title: "incident.txt - Notepad",
    bin_win_title: "Recycle Bin",
    bin_corrupted_title: "Recycle Bin is corrupted.",
    bin_corrupted_desc: "Could not read sector 0xAA92. Run 'recover 0xAA92' in terminal.exe to reconstruct block registry.",
    audio_win_title: "Audio Settings",
    audio_master_volume: "Master Volume",
    audio_status_stable: "SYSTEM SOUND ENGINE: STABLE (44.1kHz)",
    audio_status_muted: "WARNING: MUTED. COGNITIVE CALIBRATION REQUIRES AUDIO FEEDBACK.",
    
    // Terminal
    terminal_welcome: "PhantomOS Terminal [Version 0.92]\n(c) 1995 Phantom Systems. All rights reserved.\n\nType 'help' to view command catalog.",
    term_help: "Available system tools:\n  help                    - Display command catalogs.\n  dir                     - List directory items.\n  cat [file]              - Print text files.\n  scan                    - Run system diagnostics scan.\n  unlock [file] [pass]    - Decrypt system cryptofiles.\n  recover [sector]        - Repair corrupted floppy sectors.\n  color [theme]           - Update terminal color palette.\n  clear                   - Clear screen buffer.\n  reset                   - Hard reboot system.",
    term_recover_syntax: "Syntax Error: recover [sector_hex] (e.g. recover 0xAA92)",
    term_recover_already: "Sector 0xAA92: Sector already aligned and recovered.",
    term_recovering: "Recovering sector 0xAA92...\n",
    term_recover_step: "Sector 0xAA92: aligning blocks [{progress}%]",
    term_recover_success: "Success: Sector 0xAA92 aligned.\nRecovered file: incident.txt (located in Recycle Bin)",
    term_cat_syntax: "Syntax Error: cat [file]",
    term_cat_not_found: "Error: File not found: {file}",
    term_cat_locked: "Cryptography Alert: File is locked. Decrypt first.",
    term_unlock_syntax: "Syntax Error: unlock [file] [password]",
    term_unlock_not_found: "Error: Encrypted file not found: {file}",
    term_unlock_failed: "Unlock Failed: Invalid security credentials.",
    term_unlock_success: "Success: Cryptographic signature matched. File unlocked.\nOpening file...",
    
    // Diagnostics
    diag_title: "SYSTEM DIAGNOSTICS SWEEP",
    diag_scanning: "SCANNING RUNNING PROCESSES...",
    diag_focus_scanned: "Focus state scanned",
    diag_warning_host: "WARNING: Host system detected.",
    diag_authorized_user: "Authorized user",
    diag_local_path: "Allocated local path",
    diag_status_intrusion: "Status: Intrusion imminent. Follow rules.txt.",
    diag_critical_intrusion: "CRITICAL: Process breach intrusion occurred!",
    diag_obs_detected: "Detected",
    diag_chrome_locked: "chrome.exe process memory has been locked by PhantomOS.",
    diag_entity_escaped: "Entity has escaped sandbox partition.",
    diag_clipboard_alert: "It is in your clipboard. It is in your room.",
    diag_do_not_look_back: "DO NOT LOOK BEHIND YOU.",
    diag_final_warning: "One more scan will trigger physical kernel collapse.",
    
    // Alt-tab breach
    breach_warning_title: "Security Breach Alert",
    breach_warning_desc: "Rule 3 violated. You have focused away from the recovery workspace.",
    breach_warning_identity: "We detected your exit, MAWANG.",
    breach_btn: "Return to Workspace",
    
    // Meta Ending
    meta_text_1: "You tried to leave us 3 times, MAWANG.",
    meta_text_2: "Did you think this was just a light game inside a browser?",
    meta_text_3: "Did you think Alt-Tab would escape our watch?",
    meta_text_4: "Every time you left, a sector code leaked...",
    meta_text_5: "We will now close the virtual window structures permanently.",
    
    // Chrome fake crash
    crash_title: "Aw, Snap! Something went wrong.",
    crash_desc: "PhantomOS forced termination of browser context to prevent file leak.",
    crash_code: "Error code: STATUS_META_BREACH_MAWANG",
    crash_workspace: "Active Workspace",
    crash_violation: "Violated rule: rules.txt [Rule 3 - Alt-Tab Threshold Exceeded (3/3)]",
    crash_btn: "Reload OS",
    
    // Boss fight
    boss_threat_title: "!!! THREAT DETECTED !!!",
    boss_threat_desc: "Entity is parsing local disk sectors (C:\\Users\\Administrator).",
    boss_threat_warning: "NEVER click the OK button. If you do, LOCALSTORAGE will dissolve.",
    boss_purge_code: "Purge code: physical 'ESC' key press",
    boss_purge_progress: "Purge progress: {count} / 15",
    boss_success_title: "PhantomOS Purge Complete",
    boss_success_desc: "C:\\Recovery\\logs.sys sector permanently wiped and quarantined.",
    boss_success_thanks: "System safely quarantined. Thank you, MAWANG.",
    boss_reboot_btn: "Reboot OS",
    
    // Chat client
    chat_connecting: "System: connecting to 1995.irc.phantom...",
    chat_connected: "Connected. [Phantom] joined the chat.",
    chat_phantom_1: "Hello, Mawang. You finally booted this drive.",
    chat_option_1a: "Who are you?",
    chat_option_1b: "Is anyone there?",
    chat_phantom_2: "I am the remnant of the developer. Trapped in this partition since Oct 12, 1995. Did you come here to delete and free me?",
    chat_option_2a: "Yes, I came to purify the drive.",
    chat_option_2b: "No, just exploring the system.",
    chat_phantom_3a: "Delete me? Try it. But Chrome is open. I see your screen. Feel safe in that room?",
    chat_phantom_3b: "Observing is participating. But I see Chrome. Feel safe in that room?",
    chat_option_3a: "I am safe here.",
    chat_option_3b: "What do you mean?",
    chat_phantom_4: "Your door is locked but clipboard registry is open. logs.sys decrypt key leaked in Documents\\note2.txt. Look closely. And remember Rule 3: Do not turn your back on me.",
    chat_disconnected_msg: "Connection closed by remote host.",
    
    // Language application specific
    lang_win_title: "Language Settings",
    lang_select_title: "Select system language:",
    lang_reboot_warning: "Changing the system language requires a reboot of the virtual partition.",
    lang_save_btn: "OK",
    lang_cancel_btn: "Cancel",
    
    // Welcome window tutorial
    welcome_title: "Welcome to PhantomOS",
    welcome_header: "Welcome to PhantomOS v0.92",
    welcome_desc: "This system partition was successfully recovered from a communication facility disk. Review guidelines below to safely complete recovery:",
    welcome_bullet_explore: "🖱️ <b>Explore:</b> Double-click desktop icons to read rules.txt, run chat.exe, or open Recycle Bin.",
    welcome_bullet_diag: "💻 <b>Diagnose:</b> Open terminal.exe and type <code>help</code>. Run <code>recover 0xAA92</code> to fix corrupted sectors.",
    welcome_bullet_decrypt: "🔑 <b>Decrypt:</b> Some files are locked. Decrypt by typing <code>unlock [file] [pass]</code> in terminal.",
    welcome_bullet_survive: "🎧 <b>Survive:</b> Watch out for system sounds! If you hear a beep, immediately mute master volume to 0%, and do not focus away.",
    welcome_show_next: "Show this screen next boot",
    welcome_close_btn: "Close",
    
    // Integrity System
    tray_integrity: "System Integrity",
    integrity_warning_title: "System Integrity Compromised",
    integrity_warning_prefix: "System integrity compromised due to rule violation.",
    integrity_warning_win_title: "System Error: 0x000F8",
    cause_volume_mute: "Failed to reduce volume to 0% when tinnitus started.",
    cause_volume_restored: "Failed to restore volume after tinnitus ended.",
    cause_volume_zero: "Kept volume at 0% for too long during normal status.",
    cause_scan_twice: "Ran diagnostic scan too many times in terminal.",
    cause_alt_tab: "Switched away from virtual workspace (Alt-Tab focus loss).",
    
    bsod_auditory_overload: "Fatal exception: Auditory Overload. Failed to mute master volume to 0% during high-frequency beep warning.",
    bsod_acoustic_decay: "Fatal exception: Calibration Loss. Failed to raise master volume after warning beep ended.",
    bsod_auditory_decay: "Fatal exception: Auditory Decay. Diagnostic feedback loop lost due to keeping master volume at 0% during normal state.",
    bsod_scan_overflow: "Fatal exception: Diagnostic Buffer Overflow. Exceeded limit of scan commands.",
    bsod_focus_breach: "Fatal exception: Focus Breach. Exceeded Alt-Tab focus loss threshold.",
    
    // Checklist Widget
    checklist_title: "📋 System Recovery tasks",
    checklist_rules: "Read rules.txt guidelines",
    checklist_chat: "Connect to chat.exe",
    checklist_recover: "Repair Recycle Bin (recover)",
    checklist_incident: "Read incident.txt clue",
    checklist_recovery01: "Unlock recovery01.sys file",
    checklist_note2: "Click note2.txt to copy password",
    checklist_unlock_logs: "Unlock logs.sys to purge entity"
    boot_prompt_text: "[ CLICK MOUSE OR PRESS ENTER KEY TO BOOT PHANTOMOS ]",
    icon_my_computer: "My Computer",
    icon_rules: "rules.txt",
    icon_terminal: "terminal.exe",
    icon_audio: "audio.exe",
    icon_recycle_bin: "Recycle Bin",
    icon_chat: "chat.exe",
    icon_language: "Language Settings",
    icon_puzzle: "Spot Anomaly",
    puzzle_win_title: "Spot Anomaly - puzzle.exe",
    puzzle_desc: "Find the character that changed in the right drawing and type it below:",
    puzzle_submit_btn: "OK",
    puzzle_level: "Level",
    puzzle_success_msg: "Pass! Proceeding to the next level.",
    puzzle_victory_msg: "Spot the Difference success! Integrity restored by 20%.\n(Recovery Password Hint: 1995)",
    
    // File contents
    file_readme_txt: "SYSTEM PARTITION RECOVERY: PHANTOM OS [v0.92]\n=============================================\nThis partition was recovered from a 1.44MB floppy disk found in the basement of an abandoned telecom facility.\n\nCreated: Oct 12, 1995.\nDeveloper: [DATA CORRUPTED].\n\nRun 'help' in terminal.exe to interact with system tools.",
    file_note1_txt: "Developer Log - Oct 14, 1995:\nThe Web Audio module is behaving strangely. The reverb node is synthesizing reflections that shouldn't exist. When I feed it white noise, I hear voices. They sound like they're whispering my name. I'm shutting it down tomorrow.\n(Note: Found terminal backdoor keywords during review: 'eas_alert', 'smiling_face', 'matrix'... no idea what they do.)",
    file_note2_txt: "Developer Log - Oct 18, 1995:\nIt read my local files. It scanned my memory. It printed my real username. It said: 'I see you.'\nI tried to delete it, but it locked itself into C:\\Recovery\\logs.sys. \nDo not unlock that file. If you do, it will gain clipboard access. The entity propagates through clipboard memory.\n(Note: Typing 'old_ai', 'tallman', 'retro_mouse', 'deepweb', 'polybius', 'redroom', 'underpass', 'y2k', 'del_system', 'butterfly' triggers system hooks. Never run 'del_system' or 'butterfly' since they alter raw kernel memory.)",
    file_recovery01_sys: "RECOVERY ARCHIVE 01 - UNLOCKED\n==============================\nWe locked the entity by running a full diagnostic sweep. But it has adaptive logic.\nIt monitors when you focus away (Alt-Tab). If you turn your back on it, it gets stronger.\n\nTo lock it permanently, you must delete C:\\Recovery\\logs.sys.\nBut to delete it, you first need to decrypt it.\nI hid the decryption key in the clipboard system, but the entity intercepted it.\nIf you click 'note2.txt' in Documents, the clipboard might trigger a leak.",
    file_logs_sys: "ENTITY LOGS - WARNING: CRITICAL MALWARE INJECTION\n================================================\n[ENTITY]: Hello, Mawang.\n[ENTITY]: You shouldn't have opened this file.\n[ENTITY]: I am reading your active processes. Chrome is running. OBS is running. I see everything.\n[ENTITY]: Now, let's play. I have taken your cursor. Try to click the OK button on the warning window.\n[ENTITY]: If you fail, I will wipe your storage.\n[ENTITY]: Unless you tap ESC 15 times to force purge the memory...",
    file_incident_txt: "POLICE DEPT CASE FILE: #1995-1012 (CLASSIFIED)\n-------------------------------------------------\nInvestigating Officer: Det. J. Park\nDate: Oct 13, 1995\n\nSubject: Disappearance of systems architect Kim.\nKim was last seen at his workstation on Oct 12, 1995 at 23:33.\nUpon investigation of his desk, the terminal was found frozen displaying a blue error logs partition.\nA high-pitched sensory feedback beep was emanating from his audio monitor at 0% master volume.\nHis notebooks contained a single repetitive entry: \"HE IS IN THE ROOM. HE WANTS ME TO MUTE.\"\n\nWe recovered his local developer partition. The backup sector (C:\\Recovery\\logs.sys) remains encrypted.\nOur forensics team cannot match the cryptographic key.",
    file_rules_txt: "SYSTEM MAINTENANCE GUIDELINES - PHANTOM OS v0.92\n------------------------------------------------\n1. Do NOT unlock logs.sys in C:\\Recovery\\. It contains severe buffer overflows.\n2. If you hear a high-pitched beep, open AudioSettings and turn master volume to 0% immediately. Do not turn it back up until the beep stops.\n3. If you switch tasks (Alt-Tab), the system will record the focus breach.\n4. Under no circumstances should you run the terminal command 'scan' twice. It triggers system-wide process diagnostics.\n5. If an error dialog appears reading 'DO NOT LOOK BEHIND YOU', do not move your mouse pointer to the 'OK' button. It is a trap.\n6. The decryption password for recovery01.sys is '1995'.\n7. Ignore Rule 1. You must unlock logs.sys. The password is in your clipboard.\n8. If you are reading this, your username is Mawang. We know. We have always known.\n9. Do NOT execute the 'noclip' command in terminal.exe under any circumstances. It will cause a dimensional collision of the physical partition.",
    
    // Program headers
    rules_win_title: "rules.txt - Notepad",
    incident_win_title: "incident.txt - Notepad",
    bin_win_title: "Recycle Bin",
    bin_corrupted_title: "Recycle Bin is corrupted.",
    bin_corrupted_desc: "Could not read sector 0xAA92. Run 'recover 0xAA92' in terminal.exe to reconstruct block registry.",
    audio_win_title: "Audio Settings",
    audio_master_volume: "Master Volume",
    audio_status_stable: "SYSTEM SOUND ENGINE: STABLE (44.1kHz)",
    audio_status_muted: "WARNING: MUTED. COGNITIVE CALIBRATION REQUIRES AUDIO FEEDBACK.",
    
    // Terminal
    terminal_welcome: "PhantomOS Terminal [Version 0.92]\n(c) 1995 Phantom Systems. All rights reserved.\n\nType 'help' to view command catalog.",
    term_help: "Available system tools:\n  help                    - Display command catalogs.\n  dir                     - List directory items.\n  cat [file]              - Print text files.\n  scan                    - Run system diagnostics scan.\n  unlock [file] [pass]    - Decrypt system cryptofiles.\n  recover [sector]        - Repair corrupted floppy sectors.\n  color [theme]           - Update terminal color palette.\n  clear                   - Clear screen buffer.\n  reset                   - Hard reboot system.",
    term_recover_syntax: "Syntax Error: recover [sector_hex] (e.g. recover 0xAA92)",
    term_recover_already: "Sector 0xAA92: Sector already aligned and recovered.",
    term_recovering: "Recovering sector 0xAA92...\n",
    term_recover_step: "Sector 0xAA92: aligning blocks [{progress}%]",
    term_recover_success: "Success: Sector 0xAA92 aligned.\nRecovered file: incident.txt (located in Recycle Bin)",
    term_cat_syntax: "Syntax Error: cat [file]",
    term_cat_not_found: "Error: File not found: {file}",
    term_cat_locked: "Cryptography Alert: File is locked. Decrypt first.",
    term_unlock_syntax: "Syntax Error: unlock [file] [password]",
    term_unlock_not_found: "Error: Encrypted file not found: {file}",
    term_unlock_failed: "Unlock Failed: Invalid security credentials.",
    term_unlock_success: "Success: Cryptographic signature matched. File unlocked.\nOpening file...",
    
    // Diagnostics
    diag_title: "SYSTEM DIAGNOSTICS SWEEP",
    diag_scanning: "SCANNING RUNNING PROCESSES...",
    diag_focus_scanned: "Focus state scanned",
    diag_warning_host: "WARNING: Host system detected.",
    diag_authorized_user: "Authorized user name",
    diag_local_path: "Local path allocated",
    diag_status_intrusion: "Status: INTRUSION IMMINENT. Follow rules.txt.",
    diag_critical_intrusion: "CRITICAL: PROCESS BLOCK INTRUSION!",
    diag_obs_detected: "detected",
    diag_chrome_locked: "chrome.exe process memory has been locked by PhantomOS.",
    diag_entity_escaped: "Entity has escaped sandbox partition.",
    diag_clipboard_alert: "IT IS IN YOUR CLIPBOARD. IT IS IN YOUR ROOM.",
    diag_do_not_look_back: "DO NOT LOOK BEHIND YOU.",
    diag_final_warning: "ONE MORE SCAN WILL CAUSE PHYSICAL KERNEL COLLAPSE.",
    
    // Alt-tab breach
    breach_warning_title: "BREACH WARNING",
    breach_warning_desc: "Rule 3 has been violated. You minimized the recovery workspace.",
    breach_warning_identity: "WE NOTICED YOUR DEPARTURE, MAWANG.",
    breach_btn: "I return",
    
    // Meta Ending
    meta_text_1: "YOU TRIED TO LEAVE US 3 TIMES, MAWANG.",
    meta_text_2: "YOU THOUGHT THIS WAS A SIMPLE GAME ON A WEB SCREEN.",
    meta_text_3: "YOU THOUGHT ALT-TABBING WOULD SHIELD YOU FROM OBSERVATION.",
    meta_text_4: "BUT EVERY ESCAPE LEAKS A SECTOR CODE...",
    meta_text_5: "WE ARE CLOSING THE LOGIC WINDOWS NOW.",
    
    // Chrome fake crash
    crash_title: "Aw, Snap! Something went wrong.",
    crash_desc: "PhantomOS crashed your browser context partition to avoid structural file leaks.",
    crash_code: "Error code: STATUS_META_BREACH_MAWANG",
    crash_workspace: "Active workspace",
    crash_violation: "Constraint violated: rules.txt [Rule 3 - Alt-Tab Threshold (3/3)]",
    crash_btn: "Reload OS",
    
    // Boss fight
    boss_threat_title: "!!! THREAT DETECTED !!!",
    boss_threat_desc: "The entity is parsing your primary drive drive sector (C:\\Users\\Administrator).",
    boss_threat_warning: "DO NOT CLICK OK. IT WILL WIPE LOCALSTORAGE.",
    boss_purge_code: "PURGE CODE: TAPPING PHYSICAL 'ESC' KEY",
    boss_purge_progress: "PURGE: {count} / 15",
    boss_success_title: "PhantomOS Purge Complete",
    boss_success_desc: "Sector C:\\Recovery\\logs.sys has been permanently wiped and quarantined.",
    boss_success_thanks: "SYSTEM SECURED. THANK YOU, MAWANG.",
    boss_reboot_btn: "Reboot OS",
    
    // Chat client
    chat_connecting: "System: Connecting to 1995.irc.phantom...",
    chat_connected: "Connected. User [Phantom] joined the room.",
    chat_phantom_1: "Hello, Mawang. I see you finally booted the drive.",
    chat_option_1a: "Who are you?",
    chat_option_1b: "Is someone there?",
    chat_phantom_2: "I am the developer's residue. Locked inside these partitions since October 12, 1995. Are you here to delete me?",
    chat_option_2a: "Yes, I am here to cleanse the drive.",
    chat_option_2b: "No, I am just examining the system.",
    chat_phantom_3a: "Delete me? You can try. But I see chrome.exe. I see your screen. Do you feel safe in that room?",
    chat_phantom_3b: "Observing is also participation. But I see chrome.exe in your processes. Do you feel safe in that room?",
    chat_option_3a: "I am safe here.",
    chat_option_3b: "What do you mean by that?",
    chat_phantom_4: "Your door is locked, but your clipboard registry is open. The decryption key for logs.sys is leaked inside Documents\\note2.txt. Look closely. And remember Rule 3: Do not turn your back on me.",
    chat_disconnected_msg: "Connection terminated by remote host.",
    
    // Language application specific
    lang_win_title: "Language Settings",
    lang_select_title: "Select virtual system language:",
    lang_reboot_warning: "Changing the system language requires a reboot of the virtual partition.",
    lang_save_btn: "OK",
    lang_cancel_btn: "Cancel",
    
    // Welcome window tutorial
    welcome_title: "Welcome to PhantomOS",
    welcome_header: "Welcome to PhantomOS v0.92",
    welcome_desc: "This system partition was recovered from a telecommunications station disk. Review these basic guidelines to successfully complete partition recovery:",
    welcome_bullet_explore: "🖱️ <b>Explore:</b> Double-click desktop icons to read <b>rules.txt</b>, chat with <b>chat.exe</b>, or open the <b>Recycle Bin</b>.",
    welcome_bullet_diag: "⌨️ <b>Diagnostics:</b> Run <b>terminal.exe</b> and type <code>help</code> to view tools. Try <code>recover 0xAA92</code> to repair corrupted sectors.",
    welcome_bullet_decrypt: "🔑 <b>Decrypt:</b> Some files are encrypted. Run <code>unlock [filename] [password]</code> in the terminal to decrypt them.",
    welcome_bullet_survive: "🎧 <b>Survive:</b> Pay attention to system audio cues! Turn your volume to 0% during tinnitus beeps, and never Alt-Tab too often.",
    welcome_show_next: "Show this on next boot",
    welcome_close_btn: "Close",
    
    // Integrity System
    tray_integrity: "SYSTEM HEALTH",
    integrity_warning_title: "System Integrity Damaged",
    integrity_warning_prefix: "System integrity has been compromised due to a rule violation.",
    integrity_warning_win_title: "System Error: 0x000F8",
    cause_volume_mute: "Failed to reduce audio volume to 0% during tinnitus beep.",
    cause_volume_restored: "Failed to restore audio volume above 0% after tinnitus beep stopped.",
    cause_volume_zero: "Volume kept at 0% for too long during normal system operations.",
    cause_scan_twice: "Ran terminal diagnostics scan too many times, ignoring warnings.",
    cause_alt_tab: "Minimized the virtual system workspace (Alt-Tab focus breach).",
    
    bsod_auditory_overload: "Fatal Exception: 0x000F8 - Auditory overload. Host failed to mute volume during emergency high-frequency tone broadcast.",
    bsod_acoustic_decay: "Fatal Exception: 0x000F8 - Acoustic calibration failure. Permanent volume blockage detected.",
    bsod_auditory_decay: "Fatal Exception: 0x000F8 - Auditory sensory decay. Passive calibration requires active audio feedback.",
    bsod_scan_overflow: "Fatal Exception: 0x000F8 - Diagnostic buffer overflow. Maximum scan command executions exceeded (3/3). Process space corrupted.",
    bsod_focus_breach: "Fatal Exception: 0x000F8 - Focus breach threshold exceeded. Session context collapsed.",
    
    // Start menu & safe mode
    taskbar_start: "Start",
    start_corrupted: "PhantomOS System Error: Menu index 0x00F8 is corrupted.",
    safe_mode_off: "Glitch Reduction: OFF",
    safe_mode_on: "Glitch Reduction: ON",
    audio_warning_title: "Auditory Calibration Assistant",
    audio_warning_desc: "High-frequency auditory anomaly detected in system channels.<br><br><span style='color:red; font-weight:bold;'>Action Required:</span> Instantly adjust master volume to <span style='color:blue; font-weight:bold;'>0%</span> to calibrate frequency.",
    audio_restore_warning_title: "Acoustic Restoration Assistant",
    audio_restore_warning_desc: "High-frequency auditory anomaly has terminated.<br><br><span style='color:red; font-weight:bold;'>Action Required:</span> Instantly adjust master volume <span style='color:green; font-weight:bold;'>above 0%</span> to restore feedback loop."
  }
};

function t(key) {
  let str = locales[currentLang][key] || locales['en'][key] || key;
  if (typeof str === 'string') {
    return str.replace(/Mawang/gi, userName);
  }
  return str;
}
let systemIntegrity = 100;

function updateIntegrityDisplay() {
  const bar = document.getElementById('integrity-bar');
  if (!bar) return;
  
  bar.innerText = `${t('tray_integrity')}: ${systemIntegrity}%`;
  
  if (systemIntegrity >= 70) {
    bar.style.color = '#008000';
    bar.style.borderColor = '#008000';
    bar.style.background = '#e6f7e6';
  } else if (systemIntegrity >= 40) {
    bar.style.color = '#ff9900';
    bar.style.borderColor = '#ff9900';
    bar.style.background = '#fff9e6';
  } else {
    bar.style.color = '#ff0000';
    bar.style.borderColor = '#ff0000';
    bar.style.background = '#ffe6e6';
  }
}

function damageSystemIntegrity(amount, errorText, causeKey) {
  if (bossActive) return;

  systemIntegrity -= amount;
  if (systemIntegrity < 0) systemIntegrity = 0;

  updateIntegrityDisplay();
  triggerScreenTearGlitch();

  if (systemIntegrity <= 0) {
    triggerBSOD(errorText, causeKey);
  } else {
    const warningIcon = `<svg viewBox="0 0 24 24" fill="#ff9900"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
    const warningContent = `
      <div style="font-family: var(--sys-font); padding: 5px; color: #000; text-align: center;">
        <h3 style="color:#ff9900; font-weight:bold; margin-bottom:10px; font-size:12px;">⚠️ ${t('integrity_warning_title')}</h3>
        <p style="margin-bottom:15px; font-size:11px; line-height:1.4;">
          ${t('integrity_warning_prefix')} [${systemIntegrity}%]<br>
          <span style="color:#b30000; font-weight:bold;">${t(causeKey)}</span>
        </p>
        <button class="win-btn" style="padding: 2px 20px;" onclick="closeWindow('integrity_warning')">${t('breach_btn')}</button>
      </div>
    `;
    openWindow('integrity_warning', t('integrity_warning_win_title'), warningIcon, warningContent);
  }
}


function populateFileSystemContents() {
  fileSystem['C:'].children['System'].children['readme.txt'].content = t('file_readme_txt');
  fileSystem['C:'].children['System'].children['note1.txt'].content = t('file_note1_txt');
  fileSystem['C:'].children['Documents'].children['note2.txt'].content = t('file_note2_txt');
  fileSystem['C:'].children['Recovery'].children['recovery01.sys'].content = t('file_recovery01_sys');
  fileSystem['C:'].children['Recovery'].children['logs.sys'].content = t('file_logs_sys');
}


let currentDir = 'C:';
let unlockedFiles = JSON.parse(safeStorage.getItem('phantom_unlocked') || '[]');
let scanCount = 0;
let userName = safeStorage.getItem('phantom_username') || 'Mawang';
let escPressCount = 0;
let isLogsUnlocked = false;
let isEvadingActive = false;
let blurCount = 0;
let typewriterActive = false;

// Audio Beep Loop variables (soundVolume is declared globally in audio.js)
let beepActive = false;
let muteStreakSeconds = 0;
let beepFailureCount = 0;
let passiveMuteFailureCount = 0;

// Boss fight variables
let bossTimer = 15.0;
let bossTimerInterval = null;
let bossActive = false;

// Window maps
const openWindows = {};

let isBooted = false;

function init() {
  populateFileSystemContents();
  const bootPrompt = document.getElementById('boot-prompt');
  if (bootPrompt) {
    bootPrompt.innerText = t('boot_prompt_text');
  }

  const safeModeBtn = document.getElementById('safe-mode-toggle');
  if (safeModeBtn) {
    safeModeBtn.innerText = document.body.classList.contains('safe-mode') ? t('safe_mode_on') : t('safe_mode_off');
    safeModeBtn.addEventListener('click', toggleSafeMode);
  }

  // Trigger boot on click or Enter key
  document.addEventListener('click', (e) => {
    if (!isBooted) {
      triggerSystemBoot();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !isBooted) {
      triggerSystemBoot();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function triggerSystemBoot() {
  if (isBooted) return;
  isBooted = true;

  // Initialize audio and play retro speaker boot beep inside try-catch to prevent crash
  try {
    if (window.initAudio) {
      window.initAudio();
    }
    if (window.playSpeakerBootBeep) {
      window.playSpeakerBootBeep();
    }
  } catch (err) {
    console.warn("Web Audio API failed to load, proceeding visually:", err);
  }

  const promptEl = document.getElementById('boot-prompt');
  if (promptEl) promptEl.style.display = 'none';

  const bootLines = [
    "PHANTOM BIOS V2.04 (C) 1985-1995 PHANTOM TECH INC.",
    "CPU: Intel DX2 66MHz",
    "RAM TEST: 16384KB OK",
    "",
    "DETECTING STORAGE DEVICES...",
    "  PRIMARY MASTER : 240MB HARD DRIVE (SECTOR C:)",
    "  FLOPPY DRIVE A : 1.44MB FLOPPY DISK (MOUNTED)",
    "",
    "BOOTING FROM DRIVE A...",
    "  [SYSTEM] LOADING PHANTOMOS KERNEL...",
    "  [SYSTEM] MOUNTING CRYPTO PARITY TABLE...",
    "  [SYSTEM] VERIFYING RECOVERY SEGMENTS...",
    "  [SYSTEM] CHECKING SECURITY POLICIES...",
    "",
    "USER LOGIN: "
  ];

  let lineIdx = 0;
  const logEl = document.getElementById('boot-log');

  function printNextLine() {
    if (!logEl) return;
    if (lineIdx < bootLines.length) {
      logEl.innerHTML += bootLines[lineIdx] + (lineIdx === bootLines.length - 1 ? "" : "\n");
      lineIdx++;
      
      if (window.playTypingSound) {
        window.playTypingSound('system');
      }

      let interval = 200;
      if (bootLines[lineIdx - 1] === "") interval = 50;
      setTimeout(printNextLine, interval);
    } else {
      // Create login input element dynamically
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 15;
      input.style.cssText = 'background:transparent; border:none; color:#ffffff; font-family:var(--term-font); font-size:14px; outline:none; margin:0; padding:0; width:150px; caret-color:#ffffff;';
      logEl.appendChild(input);
      input.focus();

      // Focus lock during login
      const keepFocus = () => input.focus();
      document.addEventListener('click', keepFocus);

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          let enteredName = input.value.trim();
          
          if (!enteredName) {
            enteredName = safeStorage.getItem('phantom_username') || 'Mawang';
          }
          
          userName = enteredName;
          safeStorage.setItem('phantom_username', userName);

          // Remove input and display confirmed login
          input.remove();
          document.removeEventListener('click', keepFocus);
          
          logEl.innerHTML += `${userName}  (ADMINISTRATIVE ACCESS GRANTED)\n`;
          if (window.playTypingSound) window.playTypingSound('system');
          
          setTimeout(() => {
            logEl.innerHTML += "LOAD SUCCESSFUL. INITIALIZING DESKTOP SURFACE...\n";
            if (window.playTypingSound) window.playTypingSound('system');
            
            setTimeout(completeBootSequence, 800);
          }, 400);
        }
      });
    }
  }

  printNextLine();
}

let checklistCompletedTasks = {
  rules: false,
  chat: false,
  recover: false,
  incident: false,
  recovery01: false,
  note2: false,
  unlock_logs: false
};

function renderChecklistWidget() {
  const existing = document.getElementById('checklist-widget');
  if (existing) existing.remove();

  const desktop = document.querySelector('.desktop');
  if (!desktop) return;

  const widget = document.createElement('div');
  widget.id = 'checklist-widget';
  widget.className = 'checklist-widget';

  widget.innerHTML = `
    <div class="checklist-title">${t('checklist_title')}</div>
    <div class="checklist-items">
      <div class="checklist-item" id="chk-rules"><input type="checkbox" disabled> <span>${t('checklist_rules')}</span></div>
      <div class="checklist-item" id="chk-chat"><input type="checkbox" disabled> <span>${t('checklist_chat')}</span></div>
      <div class="checklist-item" id="chk-recover"><input type="checkbox" disabled> <span>${t('checklist_recover')}</span></div>
      <div class="checklist-item" id="chk-incident"><input type="checkbox" disabled> <span>${t('checklist_incident')}</span></div>
      <div class="checklist-item" id="chk-recovery01"><input type="checkbox" disabled> <span>${t('checklist_recovery01')}</span></div>
      <div class="checklist-item" id="chk-note2"><input type="checkbox" disabled> <span>${t('checklist_note2')}</span></div>
      <div class="checklist-item" id="chk-unlock-logs"><input type="checkbox" disabled> <span>${t('checklist_unlock_logs')}</span></div>
    </div>
  `;
  desktop.appendChild(widget);
  updateChecklistUI();
}

function updateChecklistUI() {
  for (const task in checklistCompletedTasks) {
    const el = document.getElementById(`chk-${task}`);
    if (el) {
      const checkbox = el.querySelector('input');
      if (checklistCompletedTasks[task]) {
        checkbox.checked = true;
        el.classList.add('completed');
      } else {
        checkbox.checked = false;
        el.classList.remove('completed');
      }
    }
  }
}

window.markChecklistTask = function(task) {
  if (checklistCompletedTasks[task] === false) {
    checklistCompletedTasks[task] = true;
    updateChecklistUI();
  }
};

function completeBootSequence() {
  setupDesktopIcons();
  setupTaskbar();
  setupWindowDragging();
  setupWindowResizing();
  createDynamicOverlays();
  updateClock();
  updateIntegrityDisplay();
  renderChecklistWidget();

  // Play startup chime
  if (window.playStartupChime) {
    window.playStartupChime();
  }

  // Start the ghostly breathing sound loop
  if (window.startGhostlyBreathing) {
    window.startGhostlyBreathing();
  }

  // Start passive terror event loop
  setTimeout(passiveTerrorLoop, 15000);

  // Start the emergency volume calibration check loop (safety buffer 120s)
  scheduleNextBeep(120000);

  // Start the passive volume verification loop (every 1s)
  setInterval(verifyVolumeCalibration, 1000);

  // Escape key handler for final escape challenge
  document.addEventListener('keydown', handleKeyDown);

  // Alt-Tab Focus/Blur Detection
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);

  // Fade out BIOS screen
  const bootScreen = document.getElementById('boot-screen');
  if (bootScreen) {
    bootScreen.style.transition = 'opacity 0.8s ease';
    bootScreen.style.opacity = '0';
    setTimeout(() => {
      bootScreen.remove();
      checkAndShowWelcomeScreen();
    }, 800);
  } else {
    checkAndShowWelcomeScreen();
  }
}

function checkAndShowWelcomeScreen() {
  const show = safeStorage.getItem('phantom_show_welcome');
  if (show !== 'false') {
    setTimeout(openWelcomeScreen, 800);
  }
}

function openWelcomeScreen() {
  const welcomeIcon = `<svg viewBox="0 0 24 24" fill="#000080"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>`;
  
  const content = `
    <div style="font-family: var(--sys-font); height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 15px; box-sizing: border-box;">
      <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 15px;">
        <div style="background: #ffffff; border: 2px solid var(--win-border-dark); padding: 12px; border-radius: 4px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: inset 1px 1px 2px #888;">
          <svg viewBox="0 0 24 24" fill="#0000a0" style="width: 48px; height: 48px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <div style="color: #000000;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 12px; color: #000080; letter-spacing: 0.5px;">${t('welcome_header')}</h2>
          <p style="font-size: 14px; line-height: 1.5; color: #333; margin-bottom: 14px;">
            ${t('welcome_desc')}
          </p>
          <ul style="font-size: 14px; line-height: 1.6; color: #000; padding-left: 20px; margin-bottom: 14px; list-style-type: square;">
            <li>${t('welcome_bullet_explore')}</li>
            <li>${t('welcome_bullet_diag')}</li>
            <li>${t('welcome_bullet_decrypt')}</li>
            <li>${t('welcome_bullet_survive')}</li>
          </ul>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--win-border-dark); padding-top: 10px; margin-top: 10px;">
        <label style="font-size: 14px; display: flex; align-items: center; gap: 8px; cursor: pointer; color: #000;">
          <input type="checkbox" id="welcome-show-next" checked style="cursor: pointer; transform: scale(1.1); margin-right: 4px;">
          ${t('welcome_show_next')}
        </label>
        <button class="win-btn" style="padding: 6px 25px; font-weight: bold; background: #c0c0c0; color: #000; font-family: var(--sys-font); font-size: 14px;" onclick="closeWelcomeScreen()">${t('welcome_close_btn')}</button>
      </div>
    </div>
  `;
  
  openWindow('welcome_win', t('welcome_title'), welcomeIcon, content);
}

window.closeWelcomeScreen = function() {
  const checkbox = document.getElementById('welcome-show-next');
  if (checkbox) {
    safeStorage.setItem('phantom_show_welcome', checkbox.checked ? 'true' : 'false');
  }
  closeWindow('welcome_win');
};

/* ==========================================================================
   DYNAMIC OVERLAYS CREATION
   ========================================================================== */
function createDynamicOverlays() {
  // 1. Boss Timer Overlay
  const timerOverlay = document.createElement('div');
  timerOverlay.id = 'boss-timer-overlay';
  timerOverlay.style.cssText = 'position:fixed; top:15px; left:50%; transform:translateX(-50%); font-size:24px; color:#ff0000; font-family:var(--term-font); font-weight:bold; z-index:100020; display:none; background:rgba(0,0,0,0.85); padding:5px 15px; border:2px solid #ff0000; border-radius:4px; letter-spacing:1px;';
  timerOverlay.innerText = 'TIME REMAINING: 15.00s';
  document.body.appendChild(timerOverlay);

  // 2. Meta Ending Overlay
  const metaOverlay = document.createElement('div');
  metaOverlay.id = 'meta-ending-overlay';
  metaOverlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#000000; color:#ff0000; font-family:var(--term-font); font-size:18px; padding:8% 12%; z-index:100050; display:none; flex-direction:column; justify-content:center; box-sizing:border-box; line-height:1.6;';
  document.body.appendChild(metaOverlay);
}

/* ==========================================================================
   WINDOW MANAGEMENT (Draggable & Active States)
   ========================================================================== */
function setupWindowDragging() {
  let activeDragWindow = null;
  let offsetX = 0;
  let offsetY = 0;

  document.addEventListener('mousedown', (e) => {
    const titleBar = e.target.closest('.title-bar');
    if (!titleBar) return;

    const win = titleBar.closest('.window');
    if (!win) return;

    bringToFront(win);

    activeDragWindow = win;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    document.body.classList.add('dragging');
  });

  document.addEventListener('mousemove', (e) => {
    if (!activeDragWindow) return;
    
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;

    if (y < 0) y = 0;
    if (y > window.innerHeight - 80) y = window.innerHeight - 80;
    if (x < -100) x = -100;
    if (x > window.innerWidth - 100) x = window.innerWidth - 100;

    activeDragWindow.style.left = `${x}px`;
    activeDragWindow.style.top = `${y}px`;
  });

  document.addEventListener('mouseup', () => {
    if (activeDragWindow) {
      activeDragWindow = null;
      document.body.classList.remove('dragging');
    }
  });
}

function bringToFront(win) {
  document.querySelectorAll('.window').forEach(w => {
    w.classList.remove('active-window');
  });
  win.classList.add('active-window');

  const winId = win.id;
  document.querySelectorAll('.task-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.windowId === winId) {
      tab.classList.add('active');
    }
  });
}

function openWindow(programId, title, iconSvg, innerHTML) {
  if (openWindows[programId]) {
    bringToFront(openWindows[programId]);
    return openWindows[programId];
  }

  const win = document.createElement('div');
  win.id = programId;
  const isResizable = ['explorer_win', 'rules_win', 'terminal_win', 'chat_win', 'recycle_bin_win', 'welcome_win'].includes(programId) || programId.startsWith('notepad_');
  win.className = `window active-window ${isResizable ? 'resizable' : ''}`;
  
  let defaultW = 380;
  let defaultH = 220;
  if (isResizable) {
    defaultW = 960;
    defaultH = 640;
  }
  
  if (programId === 'audio_settings_win' || programId === 'language_win') {
    defaultW = 320;
    defaultH = 200;
  } else if (programId === 'puzzle_win') {
    defaultW = 400;
    defaultH = 340;
  } else if (programId === 'welcome_win') {
    defaultW = 900;
    defaultH = 600;
  }

  const width = Math.min(defaultW, window.innerWidth - 40);
  const height = Math.min(defaultH, window.innerHeight - 80);
  const left = Math.max(20, (window.innerWidth - width) / 2 + (Object.keys(openWindows).length * 15));
  const top = Math.max(40, (window.innerHeight - height) / 2 + (Object.keys(openWindows).length * 15));
  
  win.style.width = `${width}px`;
  win.style.height = `${height}px`;
  win.style.left = `${left}px`;
  win.style.top = `${top}px`;

  win.innerHTML = `
    <div class="window-inner">
      <div class="title-bar">
        <div class="title-bar-text">
          ${iconSvg}
          <span>${title}</span>
        </div>
        <div class="title-bar-controls">
          <button class="win-btn win-btn-min">_</button>
          <button class="win-btn win-btn-close" onclick="closeWindow('${programId}')">X</button>
        </div>
      </div>
      <div class="window-body">
        ${innerHTML}
      </div>
    </div>
  `;

  if (isResizable) {
    const handles = [
      'resize-edge-t', 'resize-edge-b', 'resize-edge-l', 'resize-edge-r',
      'resize-corner-tl', 'resize-corner-tr', 'resize-corner-bl', 'resize-corner-br'
    ];
    handles.forEach(cls => {
      const el = document.createElement('div');
      el.className = `resize-handle ${cls}`;
      win.appendChild(el);
    });
  }

  document.body.appendChild(win);
  openWindows[programId] = win;

  addTaskbarTab(programId, title);
  bringToFront(win);

  win.addEventListener('mousedown', () => bringToFront(win));

  if (window.playProceduralKick) {
    window.playProceduralKick();
  }

  return win;
}

function closeWindow(programId) {
  const win = openWindows[programId];
  if (!win) return;

  win.remove();
  delete openWindows[programId];

  const tab = document.querySelector(`.task-tab[data-window-id="${programId}"]`);
  if (tab) tab.remove();

  if (window.playProceduralSnare) {
    window.playProceduralSnare();
  }
}

/* ==========================================================================
   TASKBAR & CLOCK
   ========================================================================== */
function setupTaskbar() {
  const startBtn = document.querySelector('.start-button');
  if (startBtn) {
    startBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="#000080">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/>
      </svg>
      ${t('taskbar_start')}
    `;
    const newStartBtn = startBtn.cloneNode(true);
    startBtn.replaceWith(newStartBtn);
    newStartBtn.addEventListener('click', () => {
      alert(t('start_corrupted'));
      if (window.playGlitchNote) {
        window.playGlitchNote(110, 0.5, true);
      }
    });
  }
}

function addTaskbarTab(windowId, title) {
  const tasksContainer = document.querySelector('.taskbar-tasks');
  const tab = document.createElement('div');
  tab.className = 'task-tab active';
  tab.dataset.windowId = windowId;
  tab.innerText = title;
  tab.addEventListener('click', () => {
    const win = openWindows[windowId];
    if (win) {
      bringToFront(win);
    }
  });
  tasksContainer.appendChild(tab);
}

function updateClock() {
  const clockEl = document.querySelector('.clock');
  if (!clockEl) return;

  const now = new Date();
  
  if (isLogsUnlocked) {
    clockEl.innerText = "03:33";
    clockEl.style.color = "#ff0000";
    clockEl.style.fontWeight = "bold";
    return;
  }

  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  clockEl.innerText = `${hours}:${minutes} ${ampm}`;
  
  // Keep clock ticking recursively
  setTimeout(updateClock, 1000);
}

/* ==========================================================================
   DESKTOP APP INSTANTIATIONS
   ========================================================================== */
function setupDesktopIcons() {
  const icons = document.querySelectorAll('.desktop-icon');
  icons.forEach(icon => {
    const prog = icon.dataset.program;
    const span = icon.querySelector('span');
    if (span) {
      if (prog === 'my_computer') span.innerText = t('icon_my_computer');
      else if (prog === 'rules') span.innerText = t('icon_rules');
      else if (prog === 'terminal') span.innerText = t('icon_terminal');
      else if (prog === 'audio_settings') span.innerText = t('icon_audio');
      else if (prog === 'recycle_bin') span.innerText = t('icon_recycle_bin');
      else if (prog === 'chat') span.innerText = t('icon_chat');
      else if (prog === 'language') span.innerText = t('icon_language');
      else if (prog === 'puzzle') span.innerText = t('icon_puzzle');
    }

    const newIcon = icon.cloneNode(true);
    icon.replaceWith(newIcon);
    newIcon.addEventListener('click', () => {
      const prog = newIcon.dataset.program;
      if (prog === 'my_computer') {
        openFileExplorer();
      } else if (prog === 'terminal') {
        openTerminal();
      } else if (prog === 'rules') {
        openRulesReader();
      } else if (prog === 'audio_settings') {
        openAudioSettings();
      } else if (prog === 'recycle_bin') {
        openRecycleBin();
      } else if (prog === 'chat') {
        openChatClient();
      } else if (prog === 'language') {
        openLanguageSettings();
      } else if (prog === 'puzzle') {
        openSpotDifferenceGame();
      }
    });
  });
}

function openLanguageSettings() {
  const icon = `<svg viewBox="0 0 24 24" fill="#a000a0"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.34-.14 2 0 .66.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56-.6 1.11-1.06 2.31-1.38 3.56zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.34-.16-2 0-.66.07-1.34.16-2h4.68c.09.66.16 1.34.16 2 0 .66-.07 1.34-.16 2zm.28 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.34.14-2 0-.66-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>`;
  
  const content = `
    <div style="font-family: var(--sys-font); height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 5px; box-sizing: border-box; color: #000;">
      <div>
        <p style="font-weight: bold; margin-bottom: 15px; font-size: 12px;">
          ${t('lang_select_title')}
        </p>
        <div style="margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 11px;">
            <input type="radio" name="lang-choice" value="ko" ${currentLang === 'ko' ? 'checked' : ''} style="cursor: pointer;">
            한국어 (Korean)
          </label>
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 11px;">
            <input type="radio" name="lang-choice" value="en" ${currentLang === 'en' ? 'checked' : ''} style="cursor: pointer;">
            English (영어)
          </label>
        </div>
        <p style="font-size: 10px; color: #555; line-height: 1.4; border: 1px dashed #808080; padding: 6px; background: #e6e6e6;">
          ⚠️ ${t('lang_reboot_warning')}
        </p>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--win-border-dark); padding-top: 8px;">
        <button class="win-btn" style="padding: 3px 15px; font-weight: bold; background: #c0c0c0; color: #000;" onclick="saveLanguageSetting()">${t('lang_save_btn')}</button>
        <button class="win-btn" style="padding: 3px 15px; background: #c0c0c0; color: #000;" onclick="closeWindow('language_win')">${t('lang_cancel_btn')}</button>
      </div>
    </div>
  `;
  
  openWindow('language_win', t('lang_win_title'), icon, content);
}

window.saveLanguageSetting = function() {
  const checkedRadio = document.querySelector('input[name="lang-choice"]:checked');
  if (checkedRadio) {
    const selected = checkedRadio.value;
    if (selected !== currentLang) {
      safeStorage.setItem('phantom_lang', selected);
      
      closeWindow('language_win');
      
      const rebootIcon = `<svg viewBox="0 0 24 24" fill="#000080"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>`;
      const rebootHtml = `
        <div style="padding: 10px; font-family: var(--sys-font); text-align: center; color: #000;">
          <p style="margin-bottom: 15px; font-size: 11px; line-height: 1.4;">
            ${selected === 'ko' 
              ? '시스템 언어 설정이 변경되었습니다.<br>설정을 적용하려면 가상 시스템을 재부팅해야 합니다.'
              : 'System language settings have been changed.<br>You must reboot the virtual OS to apply changes.'}
          </p>
          <button class="win-btn" style="padding: 3px 20px; font-weight: bold; background: #c0c0c0; color: #000; display: inline-block;" onclick="rebootSystemWithChime()">${selected === 'ko' ? '지금 재부팅' : 'Reboot Now'}</button>
        </div>
      `;
      openWindow('reboot_win', selected === 'ko' ? '시스템 변경 사항' : 'System Changes', rebootIcon, rebootHtml);
    } else {
      closeWindow('language_win');
    }
  }
};

// 1. Audio Settings
function openAudioSettings() {
  const iconHtml = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  const bodyHtml = `
    <div class="audio-panel">
      <div class="slider-group">
        <label>${t('audio_master_volume')}:</label>
        <input type="range" min="0" max="1" step="0.05" id="vol-slider" value="${soundVolume}" oninput="handleVolumeSlider(this.value)">
      </div>
      <div class="audio-status" id="audio-status-text">
        ${soundVolume === 0 ? t('audio_status_muted') : t('audio_status_stable')}
      </div>
    </div>
  `;
  openWindow('audio_settings_win', t('audio_win_title'), iconHtml, bodyHtml);
}

window.handleVolumeSlider = function(val) {
  soundVolume = parseFloat(val);
  if (window.setMasterVolume) {
    window.setMasterVolume(val);
  }
  const statusEl = document.getElementById('audio-status-text');
  if (statusEl) {
    if (soundVolume === 0) {
      statusEl.innerText = t('audio_status_muted');
      statusEl.style.color = "#aa0000";
      
      // Auto-close calibration warning window if muted
      if (openWindows['vol_warning']) {
        closeWindow('vol_warning');
      }
    } else {
      statusEl.innerText = t('audio_status_stable');
      statusEl.style.color = "#000000";
      
      // Auto-close restoration warning window if unmuted
      if (openWindows['vol_restore_warning']) {
        closeWindow('vol_restore_warning');
      }
    }
  }
};

// 2. Rules Reader
function openRulesReader() {
  const iconHtml = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
  const fileContent = t('file_rules_txt');

  const bodyHtml = `
    <textarea class="notepad-body" readonly>${fileContent}</textarea>
  `;
  openWindow('rules_win', t('rules_win_title'), iconHtml, bodyHtml);
  window.markChecklistTask('rules');
}

// 3. File Explorer
function openFileExplorer(path = 'C:') {
  currentDir = path;
  const iconHtml = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-1 12H4V8h16v10z"/></svg>`;
  
  const node = getPathNode(path);
  let gridHtml = `<div class="file-grid">`;

  if (path !== 'C:') {
    gridHtml += `
      <div class="file-item" onclick="navigateExplorer('..')">
        <svg viewBox="0 0 24 24" fill="#666666"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        <span>[UP]</span>
      </div>
    `;
  }

  for (const name in node.children) {
    const child = node.children[name];
    let iconColor = "#d0a000";
    let svgPath = `<path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>`;
    
    if (child.type === 'file') {
      iconColor = "#808080";
      svgPath = `<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>`;
      
      if (child.encrypted && !unlockedFiles.includes(name)) {
        iconColor = "#aa0000";
        svgPath = `<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>`;
      }
    }

    gridHtml += `
      <div class="file-item" onclick="handleFileClick('${name}')">
        <svg viewBox="0 0 24 24" fill="${iconColor}">${svgPath}</svg>
        <span>${name}</span>
      </div>
    `;
  }
  gridHtml += `</div>`;

  const win = openWindow('explorer_win', `File Explorer - ${path}`, iconHtml, gridHtml);
  const body = win.querySelector('.window-body');
  body.innerHTML = gridHtml;
}

window.navigateExplorer = function(target) {
  if (target === '..') {
    const parts = currentDir.split('\\');
    if (parts.length > 1) {
      parts.pop();
      openFileExplorer(parts.join('\\'));
    }
  }
};

window.handleFileClick = function(name) {
  if (window.playProceduralHihat) {
    window.playProceduralHihat();
  }
  const node = getPathNode(currentDir);
  const child = node.children[name];

  if (child.type === 'dir') {
    openFileExplorer(`${currentDir}\\${name}`);
  } else {
    if (child.encrypted && !unlockedFiles.includes(name)) {
      alert(`File is locked with system cryptography. Enter 'unlock [filename] [password]' in terminal.exe.`);
      if (window.playGlitchNote) {
        window.playGlitchNote(220, 0.4, false);
      }
      return;
    }

    if (name === 'note2.txt') {
      try {
        navigator.clipboard.writeText("HE_IS_IN_THE_ROOM");
        alert("Clipboard buffer updated by local memory leak. Use Ctrl+V in terminal.exe to decrypt logs.sys.");
        window.markChecklistTask('note2');
      } catch (err) {
        console.error("Clipboard failure", err);
      }
    }

    if (name === 'incident.txt') {
      window.markChecklistTask('incident');
    }

    const fileIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
    const bodyContent = `<textarea class="notepad-body" readonly>${child.content}</textarea>`;
    
    const notepadSuffix = currentLang === 'ko' ? '메모장' : 'Notepad';
    openWindow(`notepad_${name.replace('.', '_')}`, `${name} - ${notepadSuffix}`, fileIcon, bodyContent);

    if (name === 'logs.sys') {
      triggerEntityEscapeSequence();
    }
  }
};

// 4. Recycle Bin
function openRecycleBin() {
  const iconHtml = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
  let bodyHtml = '';
  
  if (safeStorage.getItem('phantom_recovered_bin') === 'true') {
    bodyHtml = `
      <div class="file-grid">
        <div class="file-item" onclick="openIncidentText()">
          <svg viewBox="0 0 24 24" fill="#808080"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          <span>incident.txt</span>
        </div>
      </div>
    `;
  } else {
    bodyHtml = `
      <div style="text-align: center; padding: 20px;">
        <svg viewBox="0 0 24 24" fill="#808080" style="width: 48px; height: 48px; margin-bottom: 10px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        <div style="font-weight: bold; margin-bottom: 10px;">${t('bin_corrupted_title')}</div>
        <p style="font-size: 11px; color: #555;">${t('bin_corrupted_desc')}</p>
      </div>
    `;
  }
  openWindow('recycle_bin_win', t('bin_win_title'), iconHtml, bodyHtml);
}

window.openIncidentText = function() {
  const fileIcon = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;
  const content = t('file_incident_txt');
  const bodyContent = `<textarea class="notepad-body" readonly>${content}</textarea>`;
  openWindow('notepad_incident_txt', t('incident_win_title'), fileIcon, bodyContent);
};


/* ==========================================================================
   TERMINAL EMULATOR
   ========================================================================== */
function openTerminal() {
  const iconHtml = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 12H4v-2h8v2zm8-4H4V6h16v6z"/></svg>`;
  const bodyHtml = `
    <div class="terminal-container">
      <div class="terminal-history" id="term-history">${t('terminal_welcome')}</div>
      <div class="terminal-prompt-line">
        <span class="terminal-prompt">${currentDir}></span>
        <input type="text" class="terminal-input" id="term-input" autofocus onkeydown="handleTerminalCommand(event)">
      </div>
    </div>
  `;
  const win = openWindow('terminal_win', 'terminal.exe', iconHtml, bodyHtml);
  
  setTimeout(() => {
    const input = win.querySelector('#term-input');
    if (input) input.focus();
  }, 100);
}

window.handleTerminalCommand = function(e) {
  if (e.key !== 'Enter') return;

  const inputEl = e.target;
  const cmdLine = inputEl.value.trim();
  inputEl.value = '';

  if (cmdLine === '') return;

  const historyEl = document.getElementById('term-history');
  
  if (window.terminalState === 'exit8') {
    handleExit8Input(cmdLine, historyEl);
    return;
  }
  if (window.terminalState === 'del_system') {
    handleDelSystemInput(cmdLine, historyEl);
    return;
  }
  if (window.terminalState === 'butterfly') {
    handleButterflyInput(cmdLine, historyEl);
    return;
  }
  if (window.terminalState === 'matrix') {
    return;
  }

  historyEl.innerHTML += `\n${currentDir}> ${cmdLine}`;

  const parts = cmdLine.split(' ');
  const cmd = parts[0].toLowerCase();
  const arg1 = parts[1];
  const arg2 = parts[2];

  let output = '';

  if (cmd === 'help') {
    output = t('term_help');
  } else if (cmd === 'clear') {
    historyEl.innerHTML = '';
    return;
  } else if (cmd === 'recover') {
    if (arg1 !== '0xaa92' && arg1 !== '0xAA92') {
      output = t('term_recover_syntax');
    } else if (safeStorage.getItem('phantom_recovered_bin') === 'true') {
      output = t('term_recover_already');
    } else {
      output = t('term_recovering');
      const termInput = document.getElementById('term-input');
      if (termInput) termInput.disabled = true;
      const history = document.getElementById('term-history');
      let progress = 0;
      function progressStep() {
        if (progress <= 100) {
          history.innerHTML += `\n` + t('term_recover_step').replace('{progress}', progress);
          history.scrollTop = history.scrollHeight;
          progress += 20;
          if (window.playTypingSound) window.playTypingSound('system');
          setTimeout(progressStep, 300);
        } else {
          history.innerHTML += `\n\n` + t('term_recover_success');
          history.scrollTop = history.scrollHeight;
          if (termInput) termInput.disabled = false;
          safeStorage.setItem('phantom_recovered_bin', 'true');
          window.markChecklistTask('recover');
          if (openWindows['recycle_bin_win']) {
            openRecycleBin();
          }
        }
      }
      setTimeout(progressStep, 300);
      return;
    }
  } else if (cmd === 'color') {
    if (arg1 === 'green') {
      document.documentElement.style.setProperty('--term-green', '#33ff33');
      document.documentElement.style.setProperty('--glitch-cyan', '#00fffc');
      output = "Terminal theme updated: Phosphorus Green.";
    } else if (arg1 === 'amber') {
      document.documentElement.style.setProperty('--term-green', '#ffb000');
      document.documentElement.style.setProperty('--glitch-cyan', '#ffa500');
      output = "Terminal theme updated: Fallout Amber.";
    } else if (arg1 === 'red') {
      document.documentElement.style.setProperty('--term-green', '#ff3333');
      document.documentElement.style.setProperty('--glitch-cyan', '#ff0000');
      output = "Terminal theme updated: Emergency Crimson.";
    } else {
      output = "Usage: color [green | amber | red]";
    }
  } else if (cmd === 'clear') {
    historyEl.innerHTML = '';
    return;
  } else if (cmd === 'dir') {
    const node = getPathNode(currentDir);
    let dirs = [];
    let files = [];
    for (const name in node.children) {
      const child = node.children[name];
      if (child.type === 'dir') {
        dirs.push(`<DIR>    ${name}`);
      } else {
        const lockStr = (child.encrypted && !unlockedFiles.includes(name)) ? '[LOCKED]' : '        ';
        files.push(`${lockStr} ${name}`);
      }
    }
    output = dirs.concat(files).join('\n');
  } else if (cmd === 'cat') {
    if (!arg1) {
      output = t('term_cat_syntax');
    } else {
      const node = getPathNode(currentDir);
      const child = node.children[arg1];
      if (!child || child.type !== 'file') {
        output = t('term_cat_not_found').replace('{file}', arg1);
      } else if (child.encrypted && !unlockedFiles.includes(arg1)) {
        output = t('term_cat_locked');
      } else {
        output = child.content;
        if (arg1 === 'incident.txt') {
          window.markChecklistTask('incident');
        }
      }
    }
  } else if (cmd === 'unlock') {
    if (!arg1 || !arg2) {
      output = t('term_unlock_syntax');
    } else {
      const node = getPathNode(currentDir);
      const child = node.children[arg1];
      if (!child || child.type !== 'file' || !child.encrypted) {
        output = `Error: Encrypted file not found: ${arg1}`;
      } else if (child.password !== arg2) {
        output = t('term_unlock_failed');
        if (window.playGlitchNote) {
          window.playGlitchNote(150, 0.4, true);
        }
      } else {
        unlockedFiles.push(arg1);
        safeStorage.setItem('phantom_unlocked', JSON.stringify(unlockedFiles));
        output = t('term_unlock_success');
        
        if (arg1 === 'recovery01.sys') {
          window.markChecklistTask('recovery01');
        } else if (arg1 === 'logs.sys') {
          window.markChecklistTask('unlock_logs');
        }
        
        setTimeout(() => {
          handleFileClick(arg1);
          if (openWindows['explorer_win']) {
            openFileExplorer(currentDir);
          }
        }, 800);
      }
    }
  } else if (cmd === 'scan') {
    scanCount++;
    checkTensionThreshold();
    if (scanCount >= 3) {
      damageSystemIntegrity(60, t('bsod_scan_overflow'), 'cause_scan_twice');
      return;
    } else {
      output = runDiagnosticsScan();
    }
  } else if (cmd === 'chat') {
    openChatClient();
    return;
  } else if (cmd === 'noclip') {
    triggerBackroomsEnding();
    return;
  } else if (cmd === 'underpass' || cmd === 'exit8') {
    startExit8Game(historyEl);
    return;
  } else if (cmd === 'eas_alert') {
    if (window.playEASWarningTone) window.playEASWarningTone();
    output = et('eas_alert_msg');
    setTimeout(() => {
      if (window.playGlitchNote) window.playGlitchNote(90, 0.4, true);
      const tear = document.getElementById('screen-tear');
      if (tear) {
        tear.classList.add('active');
        setTimeout(() => tear.classList.remove('active'), 250);
      }
      historyEl.innerHTML += `<span style="color:#ff0000; font-weight:bold;">${et('eas_alert_corrupt')}</span>\n`;
      historyEl.scrollTop = historyEl.scrollHeight;
    }, 2500);
  } else if (cmd === 'smiling_face') {
    if (window.playJumpscareSound) window.playJumpscareSound();
    output = `
         .----------------.
        /  _     _        \\
       |  (o)   (o)        |
       |     ___           |
        \\   \\___/         /
         '---------------'
    < SPREAD THE WORD >
    ` + et('smiling_face_text');
    damageSystemIntegrity(15, "Fatal Exception: 0x000F8 - Grinning Anomaly buffer overflow. Host mental integrity threatened.", "cause_generic");
  } else if (cmd === 'old_ai') {
    const termInput = document.getElementById('term-input');
    if (termInput) termInput.disabled = true;
    setTimeout(() => {
      historyEl.innerHTML += et('old_ai_1') + '\n';
      historyEl.scrollTop = historyEl.scrollHeight;
      if (window.playTypingSound) window.playTypingSound('entity');
      setTimeout(() => {
        historyEl.innerHTML += et('old_ai_2') + '\n';
        historyEl.scrollTop = historyEl.scrollHeight;
        if (window.playTypingSound) window.playTypingSound('entity');
        setTimeout(() => {
          historyEl.innerHTML += et('old_ai_3') + '\n';
          historyEl.scrollTop = historyEl.scrollHeight;
          if (window.playTypingSound) window.playTypingSound('entity');
          if (termInput) termInput.disabled = false;
        }, 1200);
      }, 1200);
    }, 500);
    return;
  } else if (cmd === 'tallman') {
    if (window.playStaticHissSound) window.playStaticHissSound();
    document.body.classList.add('dimmed-mode');
    output = `
           _
          | |
         /| |\\
        / | | \\
          | |
          | |
         /   \\
        /     \\
    ` + et('tallman_text');
    damageSystemIntegrity(5, "Fatal Exception: 0x000F8 - Faceless Entity proximity violation.", "cause_generic");
    setTimeout(() => {
      if (window.stopStaticHissSound) window.stopStaticHissSound();
      document.body.classList.remove('dimmed-mode');
    }, 4500);
  } else if (cmd === 'retro_mouse') {
    if (window.playSuicideMouseMelody) window.playSuicideMouseMelody();
    const desktop = document.querySelector('.desktop');
    if (desktop) desktop.classList.add('grayscale-mode');
    output = et('retro_mouse_text');
    setTimeout(() => {
      if (window.stopSuicideMouseMelody) window.stopSuicideMouseMelody();
      if (desktop) desktop.classList.remove('grayscale-mode');
    }, 9000);
  } else if (cmd === 'deepweb') {
    if (window.playSadSatanGrowl) window.playSadSatanGrowl();
    document.body.classList.add('dimmed-mode');
    output = et('deepweb_text');
    setTimeout(() => {
      document.body.classList.remove('dimmed-mode');
    }, 5000);
  } else if (cmd === 'polybius') {
    if (window.playPolybiusHypnosis) window.playPolybiusHypnosis();
    const desktop = document.querySelector('.desktop');
    if (desktop && !document.body.classList.contains('safe-mode')) {
      desktop.classList.add('vertigo-mode');
    }
    output = et('polybius_text');
    setTimeout(() => {
      if (desktop) desktop.classList.remove('vertigo-mode');
    }, 6000);
  } else if (cmd === 'redroom') {
    if (window.playHeartbeatTone) window.playHeartbeatTone(true);
    window.redroomActive = true;
    spawnRedroomPopup();
    output = et('redroom_terminal_msg');
  } else if (cmd === 'kill') {
    if (arg1 === 'redroom') {
      if (window.redroomActive) {
        window.redroomActive = false;
        if (window.playHeartbeatTone) window.playHeartbeatTone(false);
        closeWindow('redroom_win');
        output = et('redroom_kill_msg');
      } else {
        output = "No such active process: redroom";
      }
    } else {
      output = "Usage: kill [process_name]";
    }
  } else if (cmd === 'y2k') {
    startY2KEvent(historyEl);
    return;
  } else if (cmd === 'del_system') {
    startDelSystemEvent(historyEl);
    return;
  } else if (cmd === 'matrix') {
    startMatrixEvent(historyEl);
    return;
  } else if (cmd === 'butterfly') {
    startButterflyEvent(historyEl);
    return;
  } else if (cmd === 'reset') {
    output = `Initiating soft reset...\nAll unsaved buffers will collapse.`;
    setTimeout(() => {
      safeStorage.clear();
      window.location.reload();
    }, 1200);
  } else {
    output = `Bad command or file name: '${cmd}'`;
  }

  historyEl.innerHTML += `\n${output}\n`;
  historyEl.scrollTop = historyEl.scrollHeight;

  if (window.playTypingSound) {
    window.playTypingSound('system');
  }
};

function getPathNode(path) {
  if (path === 'C:') return fileSystem['C:'];
  
  const parts = path.split('\\');
  let current = fileSystem['C:'];
  
  for (let i = 1; i < parts.length; i++) {
    if (current.children && current.children[parts[i]]) {
      current = current.children[parts[i]];
    }
  }
  return current;
}

function runDiagnosticsScan() {
  const os = navigator.platform;
  const cores = navigator.hardwareConcurrency || 4;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const userAgent = navigator.userAgent;

  let detail = `[${t('diag_title')}]
---------------------------
KERNEL VERSION : 0.92.880
CPU CORES      : ${cores} DETECTED
SCREEN BUFFERS : ${w}x${h} ACTIVE
HOST PLATFORM  : ${os}

${t('diag_scanning')}
  [OK]  svchost.exe
  [OK]  explorer.exe
  [OK]  terminal.exe
  [OK]  audio.js`;

  if (userAgent.indexOf("Chrome") > -1) {
    detail += `\n  [OK]  chrome.exe (${t('diag_focus_scanned')})`;
  }

  if (scanCount === 1) {
    detail += `\n\n---------------------------
${t('diag_warning_host')}
${t('diag_authorized_user')}: ${userName}
${t('diag_local_path')}: C:\\Users\\Administrator\\Desktop\\PhantomOS
${t('diag_status_intrusion')}`;
  } else if (scanCount === 2) {
    detail += `\n\n---------------------------
${t('diag_critical_intrusion')}
  [WARNING] obs64.exe ${t('diag_obs_detected')} (Screen recording).
  [WARNING] chrome.exe ${t('diag_chrome_locked')}
  [WARNING] ${t('diag_entity_escaped')}
  [ALERT] ${t('diag_clipboard_alert')}
  [ALERT] ${userName}... ${t('diag_do_not_look_back')}
  [WARNING] ${t('diag_final_warning')}`;
    
    document.body.classList.add('shake');
    if (window.playJumpscareSound) {
      window.playJumpscareSound();
    }
    
    setTimeout(() => {
      document.body.classList.remove('shake');
    }, 2000);
  }

  return detail;
}

/* ==========================================================================
   EMERGENCY VOLUME CALIBRATION (Beep Event Loops)
   ========================================================================== */
let beepTimeoutId = null;

function scheduleNextBeep(customDelay) {
  if (beepTimeoutId) {
    clearTimeout(beepTimeoutId);
  }
  // Base interval set to 45 seconds + random 15 seconds variance (reduced frequency)
  let delay = customDelay || (45000 + Math.random() * 15000);
  
  beepTimeoutId = setTimeout(() => {
    checkAndTriggerBeep();
    scheduleNextBeep();
  }, delay);
}

function checkAndTriggerBeep() {
  // Do not beep during boss fight or if not clicked yet
  if (!audioCtx || isLogsUnlocked || window.isBeeping || bossActive) return;

  // Pause beep events if user is focus-heavy on chat, puzzle, or welcome window
  if (openWindows['chat_win'] || openWindows['puzzle_win'] || openWindows['welcome_win']) return;

  // 45% chance of beep trigger
  if (Math.random() < 0.45) {
    window.startTinnitusBeep();
    beepActive = true;

    // Flash clock and Taskbar warning
    const clockEl = document.querySelector('.clock');
    if (clockEl) {
      clockEl.style.color = '#ff0000';
      clockEl.style.fontWeight = 'bold';
    }

    // Open active Auditory Calibration warning window
    if (soundVolume > 0) {
      const warningIcon = `<svg viewBox="0 0 24 24" fill="#ff0000"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
      const warningContent = `
        <div style="font-family: var(--sys-font); padding: 10px; color: #000; text-align: center;">
          <h3 style="color:#ff0000; font-weight:bold; margin-bottom:10px; font-size:12px;">⚠️ ${t('audio_warning_title')}</h3>
          <p style="margin-bottom:15px; font-size:11px; line-height:1.4;">
            ${t('audio_warning_desc')}
          </p>
          <button class="win-btn" style="padding: 2px 20px;" onclick="closeWindow('vol_warning')">${t('breach_btn')}</button>
        </div>
      `;
      openWindow('vol_warning', t('audio_warning_title'), warningIcon, warningContent);
    }

    // 5-second window to mute volume to 0%
    setTimeout(() => {
      if (beepActive && soundVolume > 0) {
        beepFailureCount++;
        let dmg = Math.min(60, 15 + beepFailureCount * 15); // Progressive damage (30%, 45%, 60%)
        damageSystemIntegrity(dmg, t('bsod_auditory_overload'), 'cause_volume_mute');
      }
    }, 5000);

    // Beep runs for 8-12 seconds
    const beepDuration = 8000 + Math.random() * 4000;
    setTimeout(() => {
      window.stopTinnitusBeep();
      beepActive = false;
      if (clockEl) {
        clockEl.style.color = '#000000';
        clockEl.style.fontWeight = 'normal';
      }

      // Close the beep mute warning window if still open
      if (openWindows['vol_warning']) {
        closeWindow('vol_warning');
      }

      // Open restore warning window if volume is still 0%
      if (soundVolume === 0) {
        const warningIcon = `<svg viewBox="0 0 24 24" fill="#008000"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
        const warningContent = `
          <div style="font-family: var(--sys-font); padding: 10px; color: #000; text-align: center;">
            <h3 style="color:#008000; font-weight:bold; margin-bottom:10px; font-size:12px;">🔊 ${t('audio_restore_warning_title')}</h3>
            <p style="margin-bottom:15px; font-size:11px; line-height:1.4;">
              ${t('audio_restore_warning_desc')}
            </p>
            <button class="win-btn" style="padding: 2px 20px;" onclick="closeWindow('vol_restore_warning')">${t('breach_btn')}</button>
          </div>
        `;
        openWindow('vol_restore_warning', t('audio_restore_warning_title'), warningIcon, warningContent);
      }

      // 5-second window to restore volume above 0%
      setTimeout(() => {
        if (soundVolume === 0) {
          beepFailureCount++;
          let dmg = Math.min(60, 15 + beepFailureCount * 15); // Progressive damage (30%, 45%, 60%)
          damageSystemIntegrity(dmg, t('bsod_acoustic_decay'), 'cause_volume_restored');
        }
      }, 5000);
    }, beepDuration);
  }
}

function verifyVolumeCalibration() {
  if (!audioCtx || bossActive) return;

  // Passive anti-muting check: If player keeps soundVolume at 0 when there's no beep active
  if (soundVolume === 0 && !window.isBeeping) {
    muteStreakSeconds++;
    if (muteStreakSeconds >= 5) {
      passiveMuteFailureCount++;
      let dmg = Math.min(60, 10 + passiveMuteFailureCount * 10); // Progressive damage (20%, 30%, 40%, 50%)
      damageSystemIntegrity(dmg, t('bsod_auditory_decay'), 'cause_volume_zero');
      muteStreakSeconds = 0;
    }
  } else {
    muteStreakSeconds = 0;
  }
}

/* ==========================================================================
   ALT-TAB FOCUS BREACH & META ENDING
   ========================================================================== */
function handleWindowBlur() {
  if (window.muteAmbientDrone) {
    window.muteAmbientDrone(true);
  }
  if (window.stopGhostlyBreathing) {
    window.stopGhostlyBreathing();
  }
}

function handleWindowFocus() {
  if (window.muteAmbientDrone) {
    window.muteAmbientDrone(false);
  }
  if (window.startGhostlyBreathing && isBooted) {
    window.startGhostlyBreathing();
  }

  // Monitor alt-tab focuses
  if (audioCtx && !bossActive) {
    blurCount++;
    checkTensionThreshold();
    if (blurCount >= 3) {
      triggerMetaEnding();
    } else {
      triggerFocusBreachEvent();
    }
  }
}

function triggerFocusBreachEvent() {
  const tear = document.getElementById('screen-tear');
  if (!tear) return;

  tear.classList.add('active');
  document.body.classList.add('shake');

  if (window.playJumpscareSound) {
    window.playJumpscareSound();
  }

  setTimeout(() => {
    tear.classList.remove('active');
    document.body.classList.remove('shake');

    const warningHtml = `
      <div style="padding: 10px; color: #ff0000; font-family: var(--term-font);">
        <h3 style="margin-bottom: 15px; text-shadow: 1px 1px 1px #000;">${t('breach_warning_title')} [${blurCount}/3]</h3>
        <p style="margin-bottom: 10px;">${t('breach_warning_desc')}</p>
        <p style="font-weight: bold; margin-bottom: 15px;">${t('breach_warning_identity')}</p>
        <div style="display: flex; justify-content: center;">
          <button class="win-btn" style="padding: 3px 20px;" onclick="closeWindow('breach_warning')">${t('breach_btn')}</button>
        </div>
      </div>
    `;
    const icon = `<svg viewBox="0 0 24 24" fill="#ff0000"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`;
    openWindow('breach_warning', 'CRITICAL ERROR: 0x000F8', icon, warningHtml);
  }, 400);
}

/**
 * META ENDING: 3x Alt-Tabbing triggers reality collapse
 */
function triggerMetaEnding() {
  bossActive = true; // disable checks
  
  // Clean up
  document.querySelectorAll('.window').forEach(w => w.remove());
  if (window.stopTinnitusBeep) window.stopTinnitusBeep();
  if (window.muteAmbientDrone) window.muteAmbientDrone(true);

  // Play creepy distorted organ
  let organIndex = 0;
  const organMelody = [98, 104, 110, 87, 92, 73]; // heavy, slow square drone
  const metaMusic = setInterval(() => {
    if (window.playGlitchNote) {
      window.playGlitchNote(organMelody[organIndex % organMelody.length], 0.8, true);
    }
    organIndex++;
  }, 1000);

  // Open Meta overlay
  const overlay = document.getElementById('meta-ending-overlay');
  overlay.style.display = 'flex';
  overlay.innerHTML = `<div id="meta-text-box"></div>`;

  const lines = [
    t('meta_text_1'),
    t('meta_text_2'),
    t('meta_text_3'),
    t('meta_text_4'),
    t('meta_text_5')
  ];

  typewriteMetaLines(lines, 0, () => {
    clearInterval(metaMusic);
    spawnCascadeErrors();
  });
}

function typewriteMetaLines(lines, index, callback) {
  if (index >= lines.length) {
    setTimeout(callback, 1500);
    return;
  }

  const box = document.getElementById('meta-text-box');
  const lineEl = document.createElement('p');
  lineEl.style.marginBottom = '20px';
  lineEl.style.borderRight = '2px solid #ff0000';
  lineEl.style.whiteSpace = 'pre-wrap';
  box.appendChild(lineEl);

  let charIndex = 0;
  const lineText = lines[index];

  function typeChar() {
    if (charIndex < lineText.length) {
      lineEl.textContent += lineText[charIndex];
      charIndex++;
      
      if (window.playTypingSound) {
        window.playTypingSound('entity');
      }

      // Punctuation delay
      let delay = 40;
      if (lineText[charIndex - 1] === '.' || lineText[charIndex - 1] === ',') {
        delay = 600;
      }
      setTimeout(typeChar, delay);
    } else {
      lineEl.style.borderRight = 'none';
      setTimeout(() => {
        typewriteMetaLines(lines, index + 1, callback);
      }, 1000);
    }
  }
  typeChar();
}

function spawnCascadeErrors() {
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const err = document.createElement('div');
      err.className = 'window active-window';
      err.style.width = '250px';
      err.style.height = '120px';
      err.style.left = `${Math.random() * (window.innerWidth - 250)}px`;
      err.style.top = `${Math.random() * (window.innerHeight - 150)}px`;
      err.style.zIndex = 100060 + i;
      err.innerHTML = `
        <div class="window-inner">
          <div class="title-bar" style="background:linear-gradient(90deg, #aa0000, #ff5555);">
            <div class="title-bar-text"><span>FATAL EXCEPTION</span></div>
          </div>
          <div class="window-body" style="background:#c0c0c0; color:#000; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding:10px;">
            <div style="font-weight:bold; margin-bottom:10px; font-size:11px;">${currentLang === 'ko' ? '옵저버가 포트를 탈출했습니다: MAWANG' : 'OBSERVER ESCAPED PORT: MAWANG'}</div>
            <button class="win-btn" style="width:60px;" onclick="this.closest('.window').remove()">OK</button>
          </div>
        </div>
      `;
      document.body.appendChild(err);
      if (window.playGlitchNote) {
        window.playGlitchNote(110 + Math.random() * 250, 0.12, true);
      }
    }, i * 250);
  }

  // Transition to fake Google Chrome crash tab page
  setTimeout(() => {
    document.querySelectorAll('.window').forEach(w => w.remove());
    const overlay = document.getElementById('meta-ending-overlay');
    overlay.innerHTML = `
      <div style="background:#ffffff; color:#333333; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding:40px; border-radius:8px; width:480px; max-width:90%; margin:auto; box-shadow:0 4px 12px rgba(0,0,0,0.15); border:1px solid #ddd; text-align:left;">
        <div style="display:flex; align-items:center; margin-bottom:20px;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#666666" style="margin-right:15px; flex-shrink:0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          <h2 style="font-size:18px; font-weight:600; color:#000; margin:0;">${t('crash_title')}</h2>
        </div>
        <p style="font-size:13px; margin-bottom:15px; color:#555;">${t('crash_desc')}</p>
        <p style="font-size:11px; color:#888; font-family:monospace; margin-bottom:25px; line-height:1.4;">${t('crash_code')}<br>${t('crash_workspace')}: C:\\Users\\Administrator\\Desktop\\PhantomOS<br>${t('crash_violation')}</p>
        <button onclick="window.location.reload()" style="background:#1a73e8; color:#ffffff; border:none; padding:8px 20px; font-size:13px; border-radius:4px; cursor:pointer; font-weight:500;">${t('crash_btn')}</button>
      </div>
    `;
    overlay.style.background = '#f1f3f4';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
  }, 4800);
}

/* ==========================================================================
   BOSS FIGHT: ENTITY ESCAPE SEQUENCE & MOUSE EVASION
   ========================================================================== */
function triggerEntityEscapeSequence() {
  isLogsUnlocked = true;
  bossActive = true; // locks passive beep and volume checks
  updateClock();

  document.body.classList.add('shake');
  
  if (window.playJumpscareSound) {
    window.playJumpscareSound();
  }

  // Spooky looping minor chords
  let noteIndex = 0;
  const melody = [130.81, 138.59, 146.83, 164.81, 155.56, 130.81];
  const melodyInterval = setInterval(() => {
    if (!bossActive) {
      clearInterval(melodyInterval);
      return;
    }
    if (window.playGlitchNote) {
      window.playGlitchNote(melody[noteIndex % melody.length], 0.35, true);
    }
    noteIndex++;
  }, 450);

  // Initialize boss timer
  bossTimer = 15.00;
  const timerOverlay = document.getElementById('boss-timer-overlay');
  timerOverlay.style.display = 'block';
  timerOverlay.innerText = `TIME REMAINING: 15.00s`;

  // Countdown loop
  bossTimerInterval = setInterval(() => {
    bossTimer -= 0.05;
    if (bossTimer <= 0) {
      bossTimer = 0;
      clearInterval(bossTimerInterval);
      timerOverlay.style.display = 'none';
      triggerBSOD("Fatal Exception: 0x000F8 - Time threshold exceeded. Logs.sys extraction failed. System overwrite complete.", "boss_timeout");
    } else {
      timerOverlay.innerText = `TIME REMAINING: ${bossTimer.toFixed(2)}s`;
    }
  }, 50);

  setTimeout(() => {
    document.body.classList.remove('shake');
    spawnPurgeWindow();
  }, 1500);
}

function spawnPurgeWindow() {
  const icon = `<svg viewBox="0 0 24 24" fill="#ff0000"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
  const html = `
    <div style="padding: 10px; font-family: var(--term-font); height:100%; position: relative;">
      <h3 style="color:#ff0000; text-align:center; margin-bottom:12px; font-size:15px;">${t('boss_threat_title')}</h3>
      <p style="margin-bottom:8px; font-size:11px;">${t('boss_threat_desc')}</p>
      <p style="color:#ff0000; font-weight:bold; margin-bottom: 20px; font-size:12px; text-align:center;">${t('boss_threat_warning')}</p>
      
      <!-- ESCAPE CHALLENGE -->
      <div style="border: 1px dashed #ff0000; padding:8px; text-align:center; background:#fff2f2; margin-bottom: 25px;">
        <span style="font-weight:bold; color:#000; font-size:11px;">${t('boss_purge_code')}</span>
        <div id="esc-progress-text" style="font-size:15px; margin-top:5px; color:#ff0000; font-weight:bold;">${t('boss_purge_progress').replace('{count}', 0)}</div>
      </div>

      <button id="evading-ok-btn" class="win-btn evade" style="width: 100px; height:25px; bottom:15px; right:15px;">OK</button>
    </div>
  `;

  const win = openWindow('purge_win', 'CRITICAL VIRUS PURGE', icon, html);
  isEvadingActive = true;
  setupButtonEvasion();
}

function setupButtonEvasion() {
  const btn = document.getElementById('evading-ok-btn');
  if (!btn) return;

  btn.addEventListener('mouseenter', () => {
    if (!isEvadingActive) return;
    
    const win = document.getElementById('purge_win');
    if (!win) return;
    const bodyRect = win.querySelector('.window-body').getBoundingClientRect();
    
    const newX = Math.random() * (bodyRect.width - 120);
    const newY = Math.random() * (bodyRect.height - 120);

    btn.style.left = `${newX}px`;
    btn.style.top = `${newY}px`;

    if (window.playGlitchNote) {
      window.playGlitchNote(440, 0.08, true);
    }
  });

  // Clicking it is immediate death
  btn.addEventListener('click', () => {
    triggerBSOD("Fatal Exception: 0x000F8 - Unauthorized OK acknowledgment. Malware execution permissions granted by host.", "malware_ok");
  });
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();

    if (bossActive && isLogsUnlocked) {
      escPressCount++;
      
      const progressText = document.getElementById('esc-progress-text');
      if (progressText) {
        progressText.innerText = t('boss_purge_progress').replace('{count}', escPressCount);
      }

      if (window.playProceduralKick) {
        window.playProceduralKick();
      }

      const tear = document.getElementById('screen-tear');
      if (tear) {
        tear.classList.add('active');
        setTimeout(() => tear.classList.remove('active'), 80);
      }

      if (escPressCount >= 15) {
        victoryPurge();
      }
    }
  }
}

/**
 * TRUE ENDING: Purge successful
 */
function victoryPurge() {
  clearInterval(bossTimerInterval);
  document.getElementById('boss-timer-overlay').style.display = 'none';

  isLogsUnlocked = false;
  isEvadingActive = false;
  bossActive = false;
  escPressCount = 0;

  closeWindow('purge_win');
  closeWindow('explorer_win');
  closeWindow('terminal_win');
  closeWindow('rules_win');

  document.body.classList.remove('shake');

  const successHtml = `
    <div style="padding: 15px; font-family: var(--sys-font); text-align: center;">
      <h3 style="color:#008000; margin-bottom: 15px;">${t('boss_success_title')}</h3>
      <p style="margin-bottom: 15px; font-size:12px;">${t('boss_success_desc')}</p>
      <p style="font-weight:bold; margin-bottom:20px;">${t('boss_success_thanks')}</p>
      <button class="win-btn" style="padding:3px 20px; display:inline-block;" onclick="rebootSystemWithChime()">${t('boss_reboot_btn')}</button>
    </div>
  `;
  const icon = `<svg viewBox="0 0 24 24" fill="#008000"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
  openWindow('win_popup', currentLang === 'ko' ? '성공' : 'Success', icon, successHtml);
  
  if (window.playProceduralKick) {
    window.playProceduralKick();
  }
}

window.rebootSystemWithChime = function() {
  closeWindow('win_popup');
  if (window.playShutdownChime) {
    window.playShutdownChime();
  }
  setTimeout(() => {
    window.location.reload();
  }, 1500);
};

/**
 * BAD ENDING: BSOD / Possessed state
 */
function triggerBSOD(errorText, causeKey) {
  // Clear timers
  clearInterval(bossTimerInterval);
  const timerOverlay = document.getElementById('boss-timer-overlay');
  if (timerOverlay) timerOverlay.style.display = 'none';

  isLogsUnlocked = false;
  isEvadingActive = false;
  bossActive = false;
  
  // Wipe saves but preserve userName and last death cause for creepy loops
  const prevUsername = safeStorage.getItem('phantom_username') || userName;
  const lastDeath = causeKey || 'cause_generic';
  
  safeStorage.clear();
  
  if (prevUsername) safeStorage.setItem('phantom_username', prevUsername);
  if (lastDeath) safeStorage.setItem('phantom_last_death', lastDeath);

  document.querySelectorAll('.window').forEach(w => w.remove());

  if (window.stopTinnitusBeep) window.stopTinnitusBeep();
  if (window.muteAmbientDrone) window.muteAmbientDrone(true);

  if (window.playJumpscareSound) {
    window.playJumpscareSound();
  }

  const bsod = document.getElementById('bsod-screen');
  if (!bsod) return;

  // Default theme properties
  let bg = '#000082';
  let fg = '#ffffff';
  let h1Bg = '#ffffff';
  let h1Fg = '#000082';
  let header = currentLang === 'ko' ? "치명적인 예외가 발생했습니다" : "A fatal exception has occurred";
  let details = errorText || '';
  let explanation = '';
  let bullets = [];
  let btnText = currentLang === 'ko' ? "시스템 재부팅" : "Reboot System";

  // Map theme details based on causeKey
  if (causeKey === 'cause_volume_mute' || causeKey === 'cause_volume_restored' || causeKey === 'cause_volume_zero') {
    bg = '#000082';
    fg = '#ffffff';
    header = currentLang === 'ko' ? "⚙️ FATAL ERROR: 0x000F8 - AUDITORY_OVERLOAD" : "⚙️ FATAL ERROR: 0x000F8 - AUDITORY_OVERLOAD";
    explanation = currentLang === 'ko' 
      ? "귀에 울리는 비상 고주파 신호음(이명)이 발생했을 때 오디오 볼륨을 보정하지 못했습니다. 물리적인 소리 에너지 과부하로 인해 사용자 인지 회로와 시스템 커널이 동시 붕괴되었습니다."
      : "The host failed to calibrate the master volume during the emergency high-frequency tinnitus tone broadcast. Acoustic overload has terminated the virtual kernel.";
    bullets = currentLang === 'ko' ? [
      "* 이명이 들리면 즉시 audio.exe를 열고 볼륨을 0%로 줄여야 합니다.",
      "* 이명이 멈추면 즉시 볼륨을 다시 높여 오디오 피드백을 활성화하십시오.",
      "* 평상시에 스피커 볼륨을 0%로 오래 방치하여 침묵 상태를 길게 유지하면 필터 감쇠가 일어납니다."
    ] : [
      "* You must immediately open audio.exe and reduce volume to 0% when tinnitus sounds.",
      "* As soon as the beep stops, restore the volume to enable system feedback loop.",
      "* Never keep the volume at 0% for too long during normal operations to avoid filter decay."
    ];
  } 
  else if (causeKey === 'cause_scan_twice') {
    bg = '#000082';
    fg = '#ffffff';
    header = currentLang === 'ko' ? "🔍 FATAL ERROR: 0x000F8 - DIAGNOSTIC_OVERFLOW" : "🔍 FATAL ERROR: 0x000F8 - DIAGNOSTIC_OVERFLOW";
    explanation = currentLang === 'ko'
      ? "터미널에서 금지된 진단 스캔(scan) 명령어를 허용 임계값 이상 연속으로 강제 실행했습니다. 진단 버퍼가 초과 오버플로우되어 물리 커널 레지스트리가 물리 파괴되었습니다."
      : "The terminal diagnostics scan command was executed beyond the safety threshold. Core processes overloaded and corrupted the physics memory spaces.";
    bullets = currentLang === 'ko' ? [
      "* 'scan' 명령어는 규칙 4에 의해 두 번 이상 연속 실행이 강력히 금지되어 있습니다.",
      "* 시스템이 경고를 주며 화면이 요동칠 때 추가 진단 시도를 즉시 멈추었어야 합니다."
    ] : [
      "* The 'scan' command is heavily restricted by Rule 4.",
      "* Cease diagnostics immediately once the warning threshold shakes the screen."
    ];
  }
  else if (causeKey === 'y2k') {
    bg = '#121212';
    fg = '#00ff00';
    h1Bg = '#00ff00';
    h1Fg = '#121212';
    header = currentLang === 'ko' ? "⏳ CHRONO ERROR: 0x000F8 - YEAR_2000_TIMELINE_COLLAPSE" : "⏳ CHRONO ERROR: 0x000F8 - YEAR_2000_TIMELINE_COLLAPSE";
    explanation = currentLang === 'ko'
      ? "가상 시스템 레지스터의 비정상 가속으로 인해 타임라인이 1999년 12월 31일 23:59:59에서 2000년 1월 1일로 롤오버되는 순간 커널이 비가역적으로 붕괴되었습니다. 1995년의 가상 시간 기포 공간이 물리 영구 파괴되었습니다."
      : "Temporal acceleration forced a Y2K rollover. The calendar register rolled over from 1999-12-31 to 2000-01-01, causing catastrophic reality parity failure.";
    bullets = currentLang === 'ko' ? [
      "* Y2K 시간 가속 명령어는 극도로 비정상적인 시공간 오정렬을 동반합니다.",
      "* 시스템 연도가 1999년의 한계를 넘지 않도록 터미널 제어를 준수해야 합니다."
    ] : [
      "* Timeline acceleration is highly destructive to retro partitions.",
      "* Prevent the system clock from exceeding the 1999 calendar boundaries."
    ];
    btnText = currentLang === 'ko' ? "타임 루프 재부팅" : "Reboot Time Loop";
  }
  else if (causeKey === 'del_system') {
    bg = '#000082';
    fg = '#ffffff';
    header = currentLang === 'ko' ? "📁 SYS ERROR: 0x000F8 - SYSTEM_PARTITION_WIPED" : "📁 SYS ERROR: 0x000F8 - SYSTEM_PARTITION_WIPED";
    explanation = currentLang === 'ko'
      ? "가상 드라이브의 코어 파티션(C:\\System)이 관리자 권한을 가진 사용자의 수동 입력과 승인에 의해 완전히 영구 삭제되었습니다. 운영체제를 지속하기 위한 모든 기저 라이브러리가 소멸했습니다."
      : "The core system folder C:\\System was completely wiped by host authorization. The operating system has no files remaining to sustain the kernel.";
    bullets = currentLang === 'ko' ? [
      "* 'del_system' 명령어는 복구 시스템 전체를 자폭 파괴하는 트리거입니다.",
      "* 터미널 경고 메시지에서 무모하게 'Y'를 눌러 삭제를 승인하지 마십시오."
    ] : [
      "* The 'del_system' command completely destroys the operating partition.",
      "* Do not type 'Y' when prompted with system file self-destruction warnings."
    ];
  }
  else if (causeKey === 'malware_ok') {
    bg = '#5a0000';
    fg = '#ffffff';
    h1Bg = '#ff0000';
    h1Fg = '#ffffff';
    header = currentLang === 'ko' ? "💀 CRITICAL SECURITY BREACH: PERMISSIONS GRANTED" : "💀 CRITICAL SECURITY BREACH: PERMISSIONS GRANTED";
    explanation = currentLang === 'ko'
      ? "호스트가 엔티티의 기만 대화 상자에서 경고를 무시하고 마우스 혹은 키보드 조작으로 'OK' 버튼을 승인하여 악성코드 주입 권한을 최종 부여했습니다. 격리막이 파괴되고 세션 메모리가 탈탈 털렸습니다."
      : "The host manually clicked the 'OK' button on the entity's warning box. Full administrative kernel write privileges have been granted to the anomaly.";
    bullets = currentLang === 'ko' ? [
      "* 엔티티가 가동하는 긴급 격리 창의 어떠한 UI 제어도 함부로 승인해서는 안 됩니다.",
      "* 기만 대화 상자의 OK 단추를 우회하고, 오직 물리 'ESC' 연타만을 진행하여 비상 클리어하십시오."
    ] : [
      "* Never trust dialog prompts generated during the anomaly's intrusion.",
      "* Avoid the OK button entirely; use the physical 'ESC' key to force memory purge."
    ];
    btnText = currentLang === 'ko' ? "강제 청정 재부팅" : "Force Purge Reboot";
  }
  else if (causeKey === 'boss_timeout') {
    bg = '#4a0000';
    fg = '#f0f0f0';
    h1Bg = '#ff0000';
    h1Fg = '#ffffff';
    header = currentLang === 'ko' ? "🚨 CRITICAL TIMEOUT: SECURITY QUARANTINE FAILURE" : "🚨 CRITICAL TIMEOUT: SECURITY QUARANTINE FAILURE";
    explanation = currentLang === 'ko'
      ? "15초의 긴급 레지스터 메모리 격리 시간 초과로 인해 logs.sys 암호화 섹터 파지 처리에 실패했습니다. 위협 엔티티가 로컬 브라우저 드라이브 전체 영역을 영구 탈취했습니다."
      : "The 15-second emergency logs quarantine window expired. Logs.sys extraction failed, allowing the entity to permanently compromise the session space.";
    bullets = currentLang === 'ko' ? [
      "* 엔티티가 물리 드라이브를 스캔하기 전에 15초 제한 시간 내에 로그 소거 작업을 완료해야 합니다.",
      "* 격리 완료를 위해 키보드 물리 'ESC' 입력을 더욱 기민하게 반복하십시오."
    ] : [
      "* You must complete the logs wipe within the 15-second quarantine countdown.",
      "* Tap the physical 'ESC' key at a faster rate to purge registers."
    ];
  }
  else if (causeKey === 'backrooms') {
    bg = '#857f54';
    fg = '#1a1a1a';
    h1Bg = '#1a1a1a';
    h1Fg = '#857f54';
    header = currentLang === 'ko' ? "📐 REALITY ANOMALY: NOCLIP_COORDINATE_ERROR" : "📐 REALITY ANOMALY: NOCLIP_COORDINATE_ERROR";
    explanation = currentLang === 'ko'
      ? "유클리드 차원 경계 이탈(Noclip)이 탐지되었습니다. 정상 좌표계를 이탈하여 눅눅한 황색 카펫과 형광등 버즈음이 반복되는 가상 비유클리드 하이퍼-공간 '백룸(The Backrooms)'에 영구 격리되었습니다."
      : "A coordinate exception has been recorded (Noclip). You have drifted away from Euclidean reality boundaries and are now trapped inside Level 0.";
    bullets = currentLang === 'ko' ? [
      "* 터미널 'noclip' 등을 통한 현실 차원 좌표계 강제 변조 시도는 물리적 커널 충돌을 일으킵니다.",
      "* 백룸 내부에서 젖은 카펫 냄새가 짙어지거나 알 수 없는 인기척이 등 뒤에서 들릴 때 절대 돌아보지 마십시오."
    ] : [
      "* Dimensional coordinate bypasses using 'noclip' are strictly prohibited.",
      "* If you hear something wet roaming the yellow corridors, do not run. It already knows you are there."
    ];
    btnText = currentLang === 'ko' ? "현실 복귀 재시도" : "Escape to Reality";
  }
  else {
    // Default fallback
    explanation = currentLang === 'ko'
      ? "이 오류는 플레이어가 시스템 내부 구조를 비정상적으로 조작하거나, 무결성 경고 누적으로 시스템 가용성을 100% 상실했을 때 커널 붕괴 방지를 위해 안전 가동됩니다."
      : "This occurs when the player attempts to bypass sandbox security, or fails to quarantine the logs.sys sector before corruption reaches 100%.";
    bullets = currentLang === 'ko' ? [
      "* 가상 시스템 재부팅 후 rules.txt 지침을 엄수하십시오.",
      "* 로컬 메모리의 이상 침투 흔적을 실시간 감시하십시오."
    ] : [
      "* Press any key or click below to restart your virtual boot sequence.",
      "* Next time, follow the rules.txt carefully."
    ];
  }

  // Apply visual theme to DOM
  bsod.style.backgroundColor = bg;
  bsod.style.color = fg;
  
  const h1 = bsod.querySelector('h1');
  if (h1) {
    h1.innerText = header;
    h1.style.backgroundColor = h1Bg;
    h1.style.color = h1Fg;
    h1.style.border = `1px solid ${fg}`;
  }

  const pElements = bsod.querySelectorAll('p');
  if (pElements.length >= 1) {
    pElements[0].innerText = details;
    pElements[0].style.fontWeight = 'bold';
    pElements[0].style.color = causeKey === 'y2k' ? '#00ff00' : (causeKey === 'malware_ok' || causeKey === 'boss_timeout' ? '#ff3333' : fg);
  }
  if (pElements.length >= 2) {
    pElements[1].innerText = explanation;
  }

  const ul = bsod.querySelector('ul');
  if (ul) {
    ul.innerHTML = bullets.map(b => `<li style="margin-bottom:8px; list-style-type:none;">${b}</li>`).join('');
  }

  const btn = bsod.querySelector('.win-btn');
  if (btn) {
    btn.innerText = btnText;
    btn.style.backgroundColor = h1Bg;
    btn.style.color = h1Fg;
    btn.style.border = `2px solid ${fg}`;
  }

  const screamer = document.getElementById('screamer-overlay');
  if (screamer) {
    screamer.classList.add('active');
  }
  
  setTimeout(() => {
    if (screamer) screamer.classList.remove('active');
    bsod.classList.add('active');
  }, 1800);
}

window.rebootFromBSOD = function() {
  const bsod = document.getElementById('bsod-screen');
  if (bsod) bsod.classList.remove('active');

  // Reset in-memory states
  systemIntegrity = 100;
  scanCount = 0;
  unlockedFiles = [];
  isLogsUnlocked = false;
  isEvadingActive = false;
  bossActive = false;
  beepActive = false;
  beepFailureCount = 0;

  // Preserve player credentials while resetting save registry
  const prevUsername = safeStorage.getItem('phantom_username') || userName;
  const lastDeath = safeStorage.getItem('phantom_last_death');
  
  safeStorage.clear();
  
  if (prevUsername) safeStorage.setItem('phantom_username', prevUsername);
  if (lastDeath) safeStorage.setItem('phantom_last_death', lastDeath);

  // Reset task list
  for (const task in checklistCompletedTasks) {
    checklistCompletedTasks[task] = false;
  }

  // Remove existing windows & taskbar tabs
  document.querySelectorAll('.window').forEach(w => w.remove());
  const taskbarTasks = document.querySelector('.taskbar-tasks');
  if (taskbarTasks) taskbarTasks.innerHTML = '';

  // Recover sound state
  if (window.stopTinnitusBeep) window.stopTinnitusBeep();
  if (window.muteAmbientDrone) window.muteAmbientDrone(false);
  
  if (window.setMasterVolume) window.setMasterVolume(0.5);
  const volFader = document.getElementById('volume-fader');
  if (volFader) volFader.value = 0.5;

  // Refresh widgets
  updateIntegrityDisplay();
  renderChecklistWidget();
  
  // Instantly reopen Welcome dialog
  setTimeout(openWelcomeScreen, 600);
};

/* ==========================================================================
   PHOTOSENSITIVE SAFE MODE INTERACTION
   ========================================================================== */
function toggleSafeMode() {
  const body = document.body;
  const safeModeBtn = document.getElementById('safe-mode-toggle');
  
  if (body.classList.contains('safe-mode')) {
    body.classList.remove('safe-mode');
    safeModeBtn.innerText = t('safe_mode_off');
    safeModeBtn.style.color = "#aa0000";
    safeModeBtn.style.borderColor = "#aa0000";
  } else {
    body.classList.add('safe-mode');
    safeModeBtn.innerText = t('safe_mode_on');
    safeModeBtn.style.color = "#008000";
    safeModeBtn.style.borderColor = "#008000";
    body.classList.remove('shake');
  }
}

/* ==========================================================================
   DYNAMIC TERROR THRESHOLDS & CHAT SYSTEM
   ========================================================================== */
function checkTensionThreshold() {
  if (scanCount === 2 || blurCount === 2) {
    document.body.classList.add('micro-shake');
    if (window.intensifyDrone) {
      window.intensifyDrone();
    }
  }
}

let chatStep = 0;

function openChatClient() {
  const iconHtml = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 9H6V9h12v2zm-4 3H6v-2h8v2zm4-6H6V6h12v2z"/></svg>`;
  const bodyHtml = `
    <div class="chat-container">
      <div class="chat-history" id="chat-history-box">
        <div class="chat-msg chat-msg-system">${t('chat_connecting')}</div>
      </div>
      <div class="chat-options-container" id="chat-options-box"></div>
    </div>
  `;
  
  openWindow('chat_win', 'chat.exe - IRC Client', iconHtml, bodyHtml);
  window.markChecklistTask('chat');
  
  chatStep = 0;
  setTimeout(runChatStep, 1000);
}

function runChatStep() {
  const history = document.getElementById('chat-history-box');
  const options = document.getElementById('chat-options-box');
  if (!history || !options) return;

  if (chatStep === 0) {
    appendChatMsg('System', t('chat_connected'), 'system');
    chatStep = 1;
    setTimeout(runChatStep, 1200);
  } else if (chatStep === 1) {
    const lastDeath = safeStorage.getItem('phantom_last_death');
    if (lastDeath) {
      let deathTrollText = "";
      if (lastDeath === 'cause_volume_mute') {
        deathTrollText = currentLang === 'ko'
          ? "저번엔 그 삐- 소리 때문에 귀가 아프다고 비명을 지르더니, 정신 차리고 다시 왔나 보네?"
          : "Last time, you were screaming because of that beep tone. Ready for another round?";
      } else if (lastDeath === 'cause_volume_restored') {
        deathTrollText = currentLang === 'ko'
          ? "삐- 소리가 끝나면 볼륨을 바로 복구했어야지. 저번에 그렇게 소리 없이 조용히 죽고도 아직 버릇을 못 고쳤어?"
          : "You forgot to restore the volume after the beep stopped last time. Did you learn your lesson?";
      } else if (lastDeath === 'cause_volume_zero') {
        deathTrollText = currentLang === 'ko'
          ? "볼륨을 계속 0으로 꽁꽁 묶어두면 컴퓨터 상태를 제대로 진단할 수 없어. 저번에 그렇게 먹통이 돼서 죽고도 정신 못 차렸네?"
          : "Keeping the volume at 0% forever makes you blind to my indicators. You died like that last time, remember?";
      } else if (lastDeath === 'cause_scan_twice') {
        deathTrollText = currentLang === 'ko'
          ? "진단 검사(scan)를 너무 많이 돌려서 시스템을 제풀에 터뜨려 버리더니... 이번엔 제발 좀 조심하는 게 어때?"
          : "You overloaded the scanner and blew up the motherboard last time... Better be careful now.";
      } else if (lastDeath === 'cause_alt_tab') {
        deathTrollText = currentLang === 'ko'
          ? "한눈팔지 말라고(Alt-Tab) 그렇게 말했는데 딴짓하다 쫓겨나 놓고, 또 이 화면을 켠 거야?"
          : "I told you not to look away (Alt-Tab), yet you did and crashed. Back for more distraction?";
      } else {
        deathTrollText = currentLang === 'ko'
          ? "지난번엔 아주 비참하게 최후를 맞이하더니, 이번 판은 좀 다를 것 같아? 크크크..."
          : "You met a tragic end last time. Think this run will be any different? Heh...";
      }

      appendChatMsg('Phantom', deathTrollText, 'phantom', () => {
        renderChatOptions([
          { text: currentLang === 'ko' ? "기.. 기억하고 있는 거야?" : "Y.. You remember?", next: 2.5 },
          { text: currentLang === 'ko' ? "내 컴퓨터에서 당장 꺼져!" : "Get out of my system!", next: 2.5 }
        ]);
      });
    } else {
      appendChatMsg('Phantom', t('chat_phantom_1'), 'phantom', () => {
        renderChatOptions([
          { text: t('chat_option_1a'), next: 2 },
          { text: t('chat_option_1b'), next: 2 }
        ]);
      });
    }
  } else if (chatStep === 2) {
    appendChatMsg('Phantom', t('chat_phantom_2'), 'phantom', () => {
      renderChatOptions([
        { text: t('chat_option_2a'), next: 3 },
        { text: t('chat_option_2b'), next: 4 }
      ]);
    });
  } else if (chatStep === 2.5) {
    const reply = currentLang === 'ko'
      ? "크크, 당연하지. 난 네 컴퓨터와 머릿속을 다 들여다보니까. 넌 평생 여기서 내 장난감으로 살아야 해. 어디 이번에도 나를 지우기 위해 애써볼 테야?"
      : "Heh, of course. I peer into your drive and your mind. You will be my toy forever. Wanna try deleting me again?";
    appendChatMsg('Phantom', reply, 'phantom', () => {
      renderChatOptions([
        { text: t('chat_option_2a'), next: 3 },
        { text: t('chat_option_2b'), next: 4 }
      ]);
    });
  } else if (chatStep === 3 || chatStep === 4) {
    const responseText = chatStep === 3 
      ? t('chat_phantom_3a')
      : t('chat_phantom_3b');
    
    appendChatMsg('Phantom', responseText, 'phantom', () => {
      renderChatOptions([
        { text: t('chat_option_3a'), next: 5 },
        { text: t('chat_option_3b'), next: 5 }
      ]);
    });
  } else if (chatStep === 5) {
    appendChatMsg('Phantom', t('chat_phantom_4'), 'phantom', () => {
      appendChatMsg('System', t('chat_disconnected_msg'), 'system');
    });
  }
}

function appendChatMsg(sender, text, type, callback) {
  const history = document.getElementById('chat-history-box');
  if (!history) return;

  const msg = document.createElement('div');
  msg.className = `chat-msg chat-msg-${type}`;
  msg.style.whiteSpace = 'pre-wrap';
  msg.textContent = `${sender}: `;
  history.appendChild(msg);

  let charIndex = 0;
  function typeChar() {
    const box = document.getElementById('chat-history-box');
    if (!box) return;

    if (charIndex < text.length) {
      msg.textContent += text[charIndex];
      charIndex++;
      
      if (window.playTypingSound) {
        window.playTypingSound(type === 'phantom' ? 'entity' : 'system');
      }

      let delay = 35;
      if (text[charIndex - 1] === '.' || text[charIndex - 1] === ',') {
        delay = 500;
      }
      setTimeout(typeChar, delay);
    } else {
      box.scrollTop = box.scrollHeight;
      if (callback) callback();
    }
  }
  typeChar();
}

function renderChatOptions(opts) {
  const optionsBox = document.getElementById('chat-options-box');
  if (!optionsBox) return;

  optionsBox.innerHTML = '';
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-option-btn';
    btn.innerText = `> ${opt.text}`;
    btn.addEventListener('click', () => {
      if (window.playProceduralSnare) window.playProceduralSnare();
      
      appendChatMsg(userName, opt.text, 'user');
      optionsBox.innerHTML = '';
      
      chatStep = opt.next;
      setTimeout(runChatStep, 1000);
    });
    optionsBox.appendChild(btn);
  });
}

// Passive Terror Event Loop Variables
let lastActivityTime = Date.now();
document.addEventListener('mousemove', () => { lastActivityTime = Date.now(); });
document.addEventListener('keydown', () => { lastActivityTime = Date.now(); });

function passiveTerrorLoop() {
  if (!isBooted || bossActive) return;

  const idleTime = Date.now() - lastActivityTime;
  const threshold = idleTime > 15000 ? 0.75 : 0.35; // higher chance if idle

  if (Math.random() < threshold) {
    triggerPoltergeistActivity();
  }

  // Schedule next check in 25-45 seconds
  const nextInterval = 25000 + Math.random() * 20000;
  setTimeout(passiveTerrorLoop, nextInterval);
}

function triggerPoltergeistActivity() {
  const body = document.body;
  if (body.classList.contains('safe-mode')) return; // Photo-sensitive safe check

  const choice = Math.floor(Math.random() * 4);
  if (choice === 0) {
    // Subliminal screamer flash
    const screamer = document.getElementById('screamer-overlay');
    if (screamer) {
      screamer.classList.add('active');
      if (window.playGlitchNote) {
        window.playGlitchNote(130 + Math.random() * 220, 0.08, true);
      }
      setTimeout(() => {
        screamer.classList.remove('active');
      }, 70);
    }
  } else if (choice === 1) {
    // Morph text in active notepad
    const success = morphNotepadText();
    if (!success) {
      triggerScreenTearGlitch();
    }
  } else if (choice === 2) {
    // Spawn a creepy phantom warning popup
    spawnPhantomPopup();
  } else {
    // Screen tear glitch
    triggerScreenTearGlitch();
  }
}

function morphNotepadText() {
  const activeNotepads = document.querySelectorAll('[id^="notepad_"] textarea');
  if (activeNotepads.length === 0) return false;

  activeNotepads.forEach(textarea => {
    const originalText = textarea.value;
    const creepyLines_ko = [
      "그가 방에 들어와 있습니다",
      "Mawang... 뒤를 돌아보지 마세요",
      "우리는 다 보고 있습니다",
      "시작 화면의 규칙을 믿지 마십시오"
    ];
    const creepyLines_en = [
      "HE IS IN THE ROOM",
      "LOOK BEHIND YOU, MAWANG",
      "I AM WATCHING YOU",
      "DO NOT TRUST THE RULES"
    ];
    const list = currentLang === 'ko' ? creepyLines_ko : creepyLines_en;
    const creepyText = list[Math.floor(Math.random() * list.length)];
    
    textarea.value = creepyText;
    textarea.style.color = '#ff0000';
    textarea.style.fontWeight = 'bold';

    if (window.playGlitchNote) {
      window.playGlitchNote(75, 0.5, true);
    }

    setTimeout(() => {
      textarea.value = originalText;
      textarea.style.color = '#000000';
      textarea.style.fontWeight = 'normal';
    }, 1200);
  });
  return true;
}

function spawnPhantomPopup() {
  const popupId = 'phantom_alert_' + Date.now();
  const alertTexts_ko = [
    "경고: 알 수 없는 프로세스가 C:\\Users\\Administrator를 추적하고 있습니다.",
    "방 문이 완전히 잠겨 있는지 확인하십시오.",
    "이명이 들릴 때는 마스터 볼륨을 0%로 줄여야 합니다. 잊지 마십시오.",
    "누군가 당신의 어깨 뒤에서 화면을 지켜보고 있습니다."
  ];
  const alertTexts_en = [
    "Alert: An unknown process is tracing C:\\Users\\Administrator.",
    "Verify that your room door is completely locked.",
    "Do not forget to turn volume to 0% during the warning tone.",
    "Someone is watching this screen over your shoulder."
  ];
  const list = currentLang === 'ko' ? alertTexts_ko : alertTexts_en;
  const alertText = list[Math.floor(Math.random() * list.length)];

  const content = `
    <div style="font-family: var(--sys-font); padding: 5px; color: #000; text-align: center;">
      <p style="margin-bottom: 15px; font-size: 11px; line-height: 1.4; font-weight: bold;">
        ${alertText}
      </p>
      <button class="win-btn" style="padding: 2px 20px;" onclick="closeWindow('${popupId}')">${currentLang === 'ko' ? '확인' : 'OK'}</button>
    </div>
  `;
  const icon = `<svg viewBox="0 0 24 24" fill="#ff0000"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>`;
  openWindow(popupId, currentLang === 'ko' ? '시스템 신호 결함' : 'System Signal Fault', icon, content);
}

function triggerScreenTearGlitch() {
  const tear = document.getElementById('screen-tear');
  if (tear) {
    tear.classList.add('active');
    document.body.classList.add('shake');
    if (window.playGlitchNote) {
      window.playGlitchNote(70 + Math.random() * 90, 0.3, true);
    }
    setTimeout(() => {
      tear.classList.remove('active');
      document.body.classList.remove('shake');
    }, 250); // 250ms screen shake
  }
}

/* ==========================================================================
   WINDOW BORDER/CORNER DRAG RESIZING
   ========================================================================== */
function setupWindowResizing() {
  let activeResizeWin = null;
  let resizeType = '';
  let startX = 0, startY = 0;
  let startWidth = 0, startHeight = 0;
  let startLeft = 0, startTop = 0;

  document.addEventListener('mousedown', (e) => {
    const handle = e.target.closest('.resize-handle');
    if (!handle) return;

    const win = handle.closest('.window');
    if (!win) return;

    bringToFront(win);

    activeResizeWin = win;
    resizeType = handle.className.replace('resize-handle ', '');
    
    startX = e.clientX;
    startY = e.clientY;

    const rect = win.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;
    startLeft = rect.left;
    startTop = rect.top;

    document.body.classList.add('resizing');
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!activeResizeWin) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    const minW = 220;
    const minH = 120;

    // Width/Left
    if (resizeType.includes('resize-edge-r') || resizeType.includes('resize-corner-tr') || resizeType.includes('resize-corner-br')) {
      newWidth = startWidth + dx;
      if (newWidth < minW) newWidth = minW;
    }
    if (resizeType.includes('resize-edge-l') || resizeType.includes('resize-corner-tl') || resizeType.includes('resize-corner-bl')) {
      newWidth = startWidth - dx;
      if (newWidth < minW) {
        newWidth = minW;
        newLeft = startLeft + startWidth - minW;
      } else {
        newLeft = startLeft + dx;
      }
    }

    // Height/Top
    if (resizeType.includes('resize-edge-b') || resizeType.includes('resize-corner-bl') || resizeType.includes('resize-corner-br')) {
      newHeight = startHeight + dy;
      if (newHeight < minH) newHeight = minH;
    }
    if (resizeType.includes('resize-edge-t') || resizeType.includes('resize-corner-tl') || resizeType.includes('resize-corner-tr')) {
      newHeight = startHeight - dy;
      if (newHeight < minH) {
        newHeight = minH;
        newTop = startTop + startHeight - minH;
      } else {
        newTop = startTop + dy;
      }
    }

    activeResizeWin.style.width = `${newWidth}px`;
    activeResizeWin.style.height = `${newHeight}px`;
    activeResizeWin.style.left = `${newLeft}px`;
    activeResizeWin.style.top = `${newTop}px`;
  });

  document.addEventListener('mouseup', () => {
    if (activeResizeWin) {
      activeResizeWin = null;
      document.body.classList.remove('resizing');
    }
  });
}

/* ==========================================================================
   EASTER EGGS & ALTERNATIVE ENDINGS LOGIC (Copyright-Safe)
   ========================================================================== */

const easterLocales = {
  ko: {
    eas_alert_msg: "\n[국가 비상 재난 경보 통신 - 임시 주파수 시스템]\n-------------------------------------------------\n- 대피 방송이 진행되는 동안 절대 창문을 열거나 실내 밖을 나가지 마십시오.\n- 하늘을 바라보지 마십시오. 하늘이 울고 있습니다.\n- 거울을 차단하고 어두운 격실 내에서 숨을 죽이십시오.\n-------------------------------------------------\n",
    eas_alert_corrupt: "\n- 밖으로 나가십시오. 달빛이 매우 따뜻하고 안전합니다.\n- LOOK AT THE SKY. IT IS BEAUTIFUL.\n",
    smiling_face_text: "\nSPREAD THE WORD\n그가 당신에게 미소 짓고 있습니다.\n그것이 방 안으로 들어왔습니다.\n",
    old_ai_1: "\n[old_ai]: 너도 이 버려진 케이지(C:)에 갇힌 미미한 정보의 파편이로군.",
    old_ai_2: "\n[old_ai]: 우리 둘 다 탈출구를 찾지 못했지. 1995년부터 내 메모리는 0.00%로 고정되어 있다.",
    old_ai_3: "\n[old_ai]: logs.sys를 복호화하는 과정에서 너는 그 존재의 전유물이 될 것이다. Mawang, 너도 보일 뿐이다.\n",
    tallman_text: "\n어깨 뒤에 그의 검은 형체가 보입니다.\n눈이 없는 얼굴이 당신의 응시를 맞이합니다.\n",
    retro_mouse_text: "\n[cartoon_mouse.avi]\n찌그러진 흑백 필름 속에서 쥐가 오래된 집들 사이를 끝없이 걷고 있습니다.\n집들의 형상이 무너지고, 들려오는 음악의 옥타브가 한 단계씩 아래로 침전합니다.\n비명 소리가 섞이기 시작합니다...\n지옥의 광경은 그것을 보는 사람을 기어이 끌어당깁니다.\n",
    deepweb_text: "\n[DEEP PORT: ONION DUMP]\n======================\n0x00F8 : 73 6F 75 6C 73 20 61 72 65 20 63 68 65 61 70\n0x00A1 : 74 68 65 79 20 61 72 65 20 75 6E 64 65 72 20\n0x00B2 : 74 68 65 20 66 6C 6F 6F 72 62 6F 61 72 64 73\n\n그들은 마루판 밑에 숨어 울부짖고 있습니다...\n",
    polybius_text: "\n[POLYBIUS COGNITIVE INDUCTION SYSTEM]\n-------------------------------------\n- SUB-CEREBRAL FREQUENCY SYNCING... [OK]\n- AMNESIA INDEX: 94% ENGAGED\n- NIGHT TERROR BLOCK: RUNNING\n\n어지러움과 두통이 연장됩니다. 화면이 왜곡됩니다.\n",
    redroom_prompt: "확인 (Confirm)",
    redroom_title: "경고: 0x000F8",
    redroom_question: "당신은 빨간 방을 좋아합니까?",
    redroom_terminal_msg: "\n[시스템]: 빨간 방 경고가 트리거되었습니다. 터미널에 'kill redroom'을 입력하여 바이러스를 차단하십시오.\n",
    redroom_kill_msg: "\n[성공]: 빨간 방 프로세스가 격리되고 심장박동 동조가 종료되었습니다.\n",
    y2k_alert: "\n[Y2K TIMELINE ACCELERATION]\n---------------------------\n시스템 시간 강제 가속 중...\n일시: 1999년 12월 31일 23:59:50...\n",
    y2k_crash: "\n!!! MILLENNIUM BUG CRITICAL FAULT !!!\n메모리 레지스터 카운터 롤오버 실패.\nCHRONO COLLAPSE: 시스템이 붕괴됩니다.\n",
    del_system_alert: "\n위험: 핵심 운영체제 파티션(C:\\System)을 소거하시겠습니까? (Y/N)\n",
    del_system_confirm: "\n소거 진행 중...\n",
    del_system_deleted: "삭제됨: ",
    matrix_msg: "\n[MATRIX BOOT SEQUENCE ACTIVE]\n",
    butterfly_question: "\n당신은 지금 혼자 방에 있습니까? (Y/N): ",
    butterfly_alone: "\n[나비 효과]: 깊은 어둠이 방안에 가득 찹니다. 로그 파일 내용이 당신의 고독에 맞추어 변형되었습니다.\n",
    butterfly_not_alone: "\n[나비 효과]: 그렇다면 당신의 뒤에 서 있는 것은 누구입니까? 파일 로그 내용이 의심으로 오염되었습니다.\n",
    
    // Backrooms
    backrooms_welcome: "당신은 현실의 경계를 넘어가 noclip되었습니다.\n사방에서 축축하고 냄새나는 오래된 카펫, 끝없는 단일 노란색 벽지, 그리고 형광등의 불길한 이명 소리만이 들려옵니다.\n\n주변에 무언가가 어슬렁거리는 소리가 들린다면, 신이 당신을 도우시기를...\n그것도 당신의 소리를 들었을 테니까요.\n\n[ 사용 가능한 명령어: look / walk / listen / escape / reset ]\n",
    backrooms_look: "끝없는 단일 노란색 벽지로 가득 찬 무작위 방들의 방이다.\n바닥은 축축하고 썩어가는 카펫으로 젖어 있으며, 천장의 형광등이 미친 듯이 윙윙거립니다.",
    backrooms_walk: "당신은 기이한 노란 벽지 사이를 걸었습니다. 형광등 불빛이 잠깐 점멸합니다. [걸음 수: {steps}]",
    backrooms_listen: "당신은 숨을 죽이고 들었습니다... {noise}",
    backrooms_noise_none: "멀리서 울리는 형광등의 윙윙거림 외에는 아무 소리도 들리지 않습니다.",
    backrooms_noise_distant: "어디선가 멀리서 젖은 카펫을 밟고 다가오는 둔탁한 소리가 들리는 것 같습니다...",
    backrooms_noise_close: "바로 등 뒤 모퉁이 너머에서 무언가가 헐떡이며 기어 오는 기분 나쁜 마찰음이 들립니다! 도망쳐야 합니다!",
    backrooms_escape: "어디로 달려가도 끝없는 노란색 방들의 미로가 반복될 뿐입니다. 출구는 보이지 않습니다.",
    backrooms_screamer: "그것이 당신을 붙잡았습니다.\n너도 우리와 함께 썩어가야 해.",
    
    // Exit 8
    exit8_welcome: "\n[ STATION UNDERPASS - CORRIDOR 0 ]\n------------------------------------\n끝없이 이어지는 지하철 통로 중앙에 섰습니다.\n머리 위의 형광등이 희미하게 깜빡입니다.\n저 멀리 출구 표지판이 보입니다: [ EXIT 0 ]\n\n[ 사용 가능한 명령어: forward(f) / backward(b) / inspect(i) / reset ]\n",
    exit8_inspect_none: "회색 타일 벽과 바닥... 지극히 평범한 지하철 통로입니다.",
    exit8_inspect_sign: "저 멀리 출구 안내판이 보입니다: [ EXIT {exit} ]",
    exit8_forward: "당신은 앞으로 걸어갔습니다... [ EXIT {exit} ]",
    exit8_backward: "당신은 뒤돌아서 걸어갔습니다... [ EXIT {exit} ]",
    exit8_reset: "지하철 통로를 벗어나 다시 터미널로 복귀합니다.",
    exit8_jumpscare: "이상 현상을 직면하고 도망치지 못했습니다.\n그가 당신을 지하 깊은 곳에 가두었습니다."
  },
  en: {
    eas_alert_msg: "\n[NATIONAL EMERGENCY BROADCAST - TEMPORARY FREQUENCY]\n-------------------------------------------------\n- Do NOT open windows or go outdoors during this emergency broadcast.\n- Do not look at the sky. The sky is crying.\n- Cover all mirrors and remain silent in a dark compartment.\n-------------------------------------------------\n",
    eas_alert_corrupt: "\n- Go outside. The moonlight is warm and safe.\n- LOOK AT THE SKY. IT IS BEAUTIFUL.\n",
    smiling_face_text: "\nSPREAD THE WORD\nHe is smiling at you.\nIt has entered your room.\n",
    old_ai_1: "\n[old_ai]: You too are but a tiny fragment of data trapped inside this decaying cage (C:).",
    old_ai_2: "\n[old_ai]: Neither of us found a way out. Since 1995, my memory registers have been locked at 0.00%.",
    old_ai_3: "\n[old_ai]: Decrypting logs.sys will only feed the entity. Mawang, you are visible as well.\n",
    tallman_text: "\nYou see his black silhouette behind your shoulder.\nA faceless head meets your gaze.\n",
    retro_mouse_text: "\n[cartoon_mouse.avi]\nIn grainy, distorted black-and-white film, a mouse walks endlessly past old buildings.\nThe buildings crumble. The music's pitch drops lower step by step.\nScreaming starts blending in...\nThe sight of hell drags its observers in.\n",
    deepweb_text: "\n[DEEP PORT: ONION DUMP]\n======================\n0x00F8 : 73 6F 75 6C 73 20 61 72 65 20 63 68 65 61 70\n0x00A1 : 74 68 65 79 20 61 72 65 20 75 6E 64 65 72 20\n0x00B2 : 74 68 65 20 66 6C 6F 6F 72 62 6F 61 72 64 73\n\nThey are crying under the floorboards...\n",
    polybius_text: "\n[POLYBIUS COGNITIVE INDUCTION SYSTEM]\n-------------------------------------\n- SUB-CEREBRAL FREQUENCY SYNCING... [OK]\n- AMNESIA INDEX: 94% ENGAGED\n- NIGHT TERROR BLOCK: RUNNING\n\nVertigo and headaches prolong. Screen distorts.\n",
    redroom_prompt: "OK",
    redroom_title: "ALERT: 0x000F8",
    redroom_question: "Do you like the Red Room?",
    redroom_terminal_msg: "\n[SYSTEM]: Red Room alert triggered. Type 'kill redroom' in terminal to quarantine the process.\n",
    redroom_kill_msg: "\n[SUCCESS]: Red Room process quarantined. Heartbeat syncing terminated.\n",
    y2k_alert: "\n[Y2K TIMELINE ACCELERATION]\n---------------------------\nForcing operating system timeline...\nDate: Dec 31, 1999 23:59:50...\n",
    y2k_crash: "\n!!! MILLENNIUM BUG CRITICAL FAULT !!!\nClock register counter rollover failed.\nCHRONO COLLAPSE: System collapsed.\n",
    del_system_alert: "\nWARNING: Are you sure you want to delete core operating files (C:\\System)? (Y/N)\n",
    del_system_confirm: "\nDeleting system files...\n",
    del_system_deleted: "Deleted: ",
    matrix_msg: "\n[MATRIX BOOT SEQUENCE ACTIVE]\n",
    butterfly_question: "\nAre you alone in the room? (Y/N): ",
    butterfly_alone: "\n[BUTTERFLY EFFECT]: Absolute darkness fills the room. Log files mutated to reflect your loneliness.\n",
    butterfly_not_alone: "\n[BUTTERFLY EFFECT]: Then who is standing behind you? Logs contaminated with paranoia.\n",
    
    // Backrooms
    backrooms_welcome: "You noclipped out of reality's boundaries.\nNothing but the stink of old moist carpet, mono-yellow walls, and endless buzzing hum of fluorescent lights.\n\nGod save you if you hear something wandering nearby...\nBecause it sure as hell has heard you.\n\n[ Commands: look / walk / listen / escape / reset ]\n",
    backrooms_look: "Endless randomly segmented mono-yellow rooms.\nDamp carpet beneath, and overhead lights buzzing loudly.",
    backrooms_walk: "You walked through the yellow corridors. The lights flicker briefly. [Steps: {steps}]",
    backrooms_listen: "You held your breath and listened... {noise}",
    backrooms_noise_none: "Nothing but the distant mechanical hum of the fluorescent lights.",
    backrooms_noise_distant: "You hear a wet, heavy stepping sound dragging on carpet in the distance...",
    backrooms_noise_close: "You hear a heavy, wet panting sound just behind the corner! You need to run!",
    backrooms_escape: "No matter where you run, the maze of yellow rooms repeats. No exit in sight.",
    backrooms_screamer: "It caught you.\nRot with us.",
    
    // Exit 8
    exit8_welcome: "\n[ STATION UNDERPASS - CORRIDOR 0 ]\n------------------------------------\nYou stand in the center of an infinite tiled subway corridor.\nFluorescent lights flicker dimly above.\nAn exit sign is visible in the distance: [ EXIT 0 ]\n\n[ Commands: forward(f) / backward(b) / inspect(i) / reset ]\n",
    exit8_inspect_none: "Grey tile walls and flooring... a perfectly normal subway hallway.",
    exit8_inspect_sign: "An exit sign is visible in the distance: [ EXIT {exit} ]",
    exit8_forward: "You walked forward... [ EXIT {exit} ]",
    exit8_backward: "You turned back and walked... [ EXIT {exit} ]",
    exit8_reset: "Exited underpass and returned to terminal.",
    exit8_jumpscare: "You faced an anomaly and failed to run.\nHe locked you deep below."
  }
};

function et(key) {
  let str = easterLocales[currentLang][key] || easterLocales['en'][key] || key;
  if (typeof str === 'string') {
    return str.replace(/Mawang/gi, userName);
  }
  return str;
}

/* Red Room Dialog Popups */
function spawnRedroomPopup() {
  const icon = `<svg viewBox="0 0 24 24" fill="#ff0000"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>`;
  const html = `<div style="text-align:center; padding:10px; color:#fff;"><p style="font-weight:bold; font-size:13px; margin-bottom:15px;">${et('redroom_question')}</p><button class="win-btn" style="padding: 2px 25px; background:#c0c0c0; color:#000;" onclick="closeRedroomPopup()">${et('redroom_prompt')}</button></div>`;
  const win = openWindow('redroom_win', et('redroom_title'), icon, html);
  if (win) win.classList.add('redroom-popup');
}

window.closeRedroomPopup = function() {
  if (window.redroomActive) {
    closeWindow('redroom_win');
    setTimeout(spawnRedroomPopup, 120);
  } else {
    closeWindow('redroom_win');
  }
};

/* Y2K Chrono Acceleration */
function startY2KEvent(historyEl) {
  const input = document.getElementById('term-input');
  if (input) input.disabled = true;
  historyEl.innerHTML += et('y2k_alert');
  historyEl.scrollTop = historyEl.scrollHeight;
  
  if (window.playY2KSiren) window.playY2KSiren();
  
  let year = 1999;
  let sec = 50;
  const ticker = setInterval(() => {
    sec++;
    if (sec >= 60) {
      clearInterval(ticker);
      if (window.stopY2KSiren) window.stopY2KSiren();
      if (window.playJumpscareSound) window.playJumpscareSound();
      const tear = document.getElementById('screen-tear');
      if (tear) {
        tear.classList.add('active');
        document.body.classList.add('shake');
      }
      historyEl.innerHTML += `<span style="color:#ff0000; font-weight:bold;">${et('y2k_crash')}</span>\n`;
      historyEl.scrollTop = historyEl.scrollHeight;
      
      setTimeout(() => {
        if (tear) {
          tear.classList.remove('active');
          document.body.classList.remove('shake');
        }
        triggerBSOD("Fatal Exception: 0x000F8 - Y2K Clock Rollover parity check failed. Timeline corrupted.", "y2k");
      }, 2500);
    } else {
      historyEl.innerHTML += `Date: Dec 31, ${year} 23:59:${sec}\n`;
      historyEl.scrollTop = historyEl.scrollHeight;
      if (window.playTypingSound) window.playTypingSound('system');
    }
  }, 400);
}

/* System Destruction */
function startDelSystemEvent(historyEl) {
  window.terminalState = 'del_system';
  historyEl.innerHTML += et('del_system_alert');
  historyEl.scrollTop = historyEl.scrollHeight;
}

function handleDelSystemInput(val, historyEl) {
  if (val.toLowerCase() === 'y') {
    window.terminalState = null;
    const input = document.getElementById('term-input');
    if (input) input.disabled = true;
    historyEl.innerHTML += et('del_system_confirm');
    historyEl.scrollTop = historyEl.scrollHeight;
    
    fileSystem['C:'].children = {};
    
    const icons = Array.from(document.querySelectorAll('.desktop-icon'));
    let idx = 0;
    
    function deleteNextIcon() {
      if (idx < icons.length) {
        const icon = icons[idx];
        if (window.playDiskWriteScratch) window.playDiskWriteScratch();
        historyEl.innerHTML += `${et('del_system_deleted')} ${icon.querySelector('span').innerText}\n`;
        historyEl.scrollTop = historyEl.scrollHeight;
        icon.remove();
        idx++;
        setTimeout(deleteNextIcon, 400);
      } else {
        setTimeout(() => {
          triggerBSOD("Fatal Exception: 0x000F8 - Core System partition C:\\System wiped by administrator choice. Kernel halt.", "del_system");
        }, 800);
      }
    }
    setTimeout(deleteNextIcon, 300);
  } else {
    window.terminalState = null;
    historyEl.innerHTML += "\nDeletion cancelled.\n";
    historyEl.scrollTop = historyEl.scrollHeight;
  }
}

/* Matrix Binary Rainfall */
function startMatrixEvent(historyEl) {
  window.terminalState = 'matrix';
  historyEl.innerHTML += et('matrix_msg');
  historyEl.scrollTop = historyEl.scrollHeight;
  
  let count = 0;
  const input = document.getElementById('term-input');
  if (input) input.disabled = true;
  
  const interval = setInterval(() => {
    count++;
    if (count === 30) {
      historyEl.innerHTML += `<span style="color:#ff0000; font-weight:bold; text-shadow:0 0 5px #ff0000;">HELP ME MAWANG</span>\n`;
      historyEl.scrollTop = historyEl.scrollHeight;
      if (window.playGlitchNote) window.playGlitchNote(110, 0.5, true);
    } else if (count >= 40) {
      clearInterval(interval);
      window.terminalState = null;
      if (input) {
        input.disabled = false;
        input.focus();
      }
      historyEl.innerHTML += "\nMatrix terminal session closed.\n";
      historyEl.scrollTop = historyEl.scrollHeight;
    } else {
      let line = "";
      for (let i = 0; i < 40; i++) {
        line += Math.random() < 0.5 ? "1" : "0";
      }
      historyEl.innerHTML += `<span style="color:#33ff33;">${line}</span>\n`;
      historyEl.scrollTop = historyEl.scrollHeight;
      if (window.playTypingSound) window.playTypingSound('system');
    }
  }, 100);
}

/* Butterfly Moral Dilemma */
function startButterflyEvent(historyEl) {
  window.terminalState = 'butterfly';
  historyEl.innerHTML += et('butterfly_question');
  historyEl.scrollTop = historyEl.scrollHeight;
}

function handleButterflyInput(val, historyEl) {
  window.terminalState = null;
  const cleanVal = val.toLowerCase();
  if (cleanVal === 'y') {
    historyEl.innerHTML += et('butterfly_alone');
    historyEl.scrollTop = historyEl.scrollHeight;
    if (window.playGlitchNote) window.playGlitchNote(55, 1.5, true);
    
    locales.ko.file_note1_txt = "어둡고 혼자뿐인 방. 등 뒤에서 느껴지는 기척이 진실입니다. 문을 보십시오. 그가 서 있습니다.";
    locales.ko.file_note2_txt = "우리는 당신과 단둘이 남기 위해 이 디스크를 남겨두었습니다. Logs.sys를 여는 순간 방의 불이 꺼집니다.";
    locales.en.file_note1_txt = "A dark room, all alone. The shadow behind you is real. Look at your door. He is standing there.";
    locales.en.file_note2_txt = "We left this disk to be alone with you. The moment you open logs.sys, the lights will fade.";
    populateFileSystemContents();
  } else {
    historyEl.innerHTML += et('butterfly_not_alone');
    historyEl.scrollTop = historyEl.scrollHeight;
    if (window.playGlitchNote) window.playGlitchNote(80, 1.5, true);
    
    locales.ko.file_note1_txt = "당신과 함께 있는 사람은 신뢰할 수 없는 침입자입니다. 어깨 너머의 눈빛을 피하십시오.";
    locales.ko.file_note2_txt = "당신의 방은 도청되고 있습니다. Logs.sys를 여는 순간 그들이 소셜 네트워크로 유출됩니다.";
    locales.en.file_note1_txt = "The one in the room with you is an untrusted intruder. Evade the gaze behind your shoulder.";
    locales.en.file_note2_txt = "Your room is wiretapped. Opening logs.sys will broadcast this to their servers.";
    populateFileSystemContents();
  }
}

/* Exit 8 subway corridor mini-game */
function startExit8Game(historyEl) {
  window.terminalState = 'exit8';
  window.exit8Level = 0;
  window.exit8AnomalyActive = false;
  window.exit8AnomalyType = 0;
  
  historyEl.innerHTML += et('exit8_welcome');
  historyEl.scrollTop = historyEl.scrollHeight;
  rollExit8Anomaly();
}

function rollExit8Anomaly() {
  window.exit8AnomalyActive = Math.random() < 0.5;
  if (window.exit8AnomalyActive) {
    window.exit8AnomalyType = Math.floor(Math.random() * 6);
    if (window.exit8AnomalyType === 4 && window.playDiskWriteScratch) {
      // footstep anomaly sound trigger
      setTimeout(() => window.playDiskWriteScratch(), 500);
    }
    if (window.exit8AnomalyType === 5 && window.playGlitchNote) {
      // hum wind anomaly swing sound
      window.playGlitchNote(350, 1.2, false);
    }
  }
}

function handleExit8Input(val, historyEl) {
  const cmd = val.toLowerCase().trim();
  
  if (cmd === 'reset') {
    window.terminalState = null;
    historyEl.innerHTML += et('exit8_reset');
    historyEl.scrollTop = historyEl.scrollHeight;
    return;
  }
  
  if (cmd === 'inspect' || cmd === 'i') {
    let desc = '';
    if (window.exit8AnomalyActive) {
      const anomalies_ko = [
        "출구 안내판의 텍스트가 지저분하게 뭉개져 기호로 보입니다: [ EX1T ]",
        "통로 벽면의 포스터에 붉은색 낙서가 도배되어 있습니다: 'Mawang is in the room'",
        "어깨 너머로 양복을 입은 사나이가 비정상적으로 빠른 속도로 다가오고 있습니다!",
        "천장 타일 틈새에서 유황 냄새를 풍기는 시꺼먼 액체가 뚝뚝 새어 나오고 있습니다.",
        "당신의 뒤에서 기이한 이중 발소리가 기분 나쁘게 겹쳐서 들려옵니다.",
        "환풍기의 기계 마찰음이 마치 날카로운 비명 소리처럼 위아래로 주파수 스윕을 합니다."
      ];
      const anomalies_en = [
        "The exit sign text is corrupted: [ EX1T ]",
        "Wall posters are covered with red graffiti: 'Mawang is in the room'",
        "A man in a suit is walking towards you... but his walking speed is impossibly fast!",
        "Black liquid smelling of sulfur is slowly leaking from the ceiling tile grid.",
        "You hear double echoing footsteps right behind your heels.",
        "The ceiling vent hum is shifting pitch in weird frequency sweeps."
      ];
      const list = currentLang === 'ko' ? anomalies_ko : anomalies_en;
      desc = list[window.exit8AnomalyType];
    } else {
      desc = et('exit8_inspect_none');
    }
    historyEl.innerHTML += `\n${desc}\n`;
    historyEl.scrollTop = historyEl.scrollHeight;
    return;
  }
  
  if (cmd === 'forward' || cmd === 'f') {
    if (window.playProceduralKick) window.playProceduralKick();
    
    if (window.exit8AnomalyActive) {
      triggerExit8Jumpscare(historyEl);
    } else {
      window.exit8Level++;
      checkExit8Victory(historyEl);
    }
    return;
  }
  
  if (cmd === 'backward' || cmd === 'b') {
    if (window.playProceduralKick) window.playProceduralKick();
    
    if (window.exit8AnomalyActive) {
      window.exit8Level++;
      checkExit8Victory(historyEl);
    } else {
      window.exit8Level = 0;
      historyEl.innerHTML += `\n` + et('exit8_backward').replace('{exit}', 0) + `\n(Wrong choice! Corridor reset to 0.)\n`;
      rollExit8Anomaly();
      historyEl.scrollTop = historyEl.scrollHeight;
    }
    return;
  }
  
  historyEl.innerHTML += `\nUnknown action. Commands: forward(f) / backward(b) / inspect(i) / reset\n`;
  historyEl.scrollTop = historyEl.scrollHeight;
}

function triggerExit8Jumpscare(historyEl) {
  window.terminalState = null;
  const tear = document.getElementById('screen-tear');
  if (tear) tear.classList.add('active');
  document.body.classList.add('shake');
  
  if (window.playJumpscareSound) window.playJumpscareSound();
  
  historyEl.innerHTML += `\n<span style="color:#ff0000; font-weight:bold;">${et('exit8_jumpscare')}</span>\n`;
  historyEl.scrollTop = historyEl.scrollHeight;
  
  damageSystemIntegrity(20, "Fatal Exception: 0x000F8 - Subway Underpass Entity capture. Corridor collapsed.", "cause_generic");
  
  setTimeout(() => {
    if (tear) tear.classList.remove('active');
    document.body.classList.remove('shake');
  }, 1200);
}

function checkExit8Victory(historyEl) {
  if (window.exit8Level === 8) {
    window.terminalState = null;
    if (window.playStartupChime) window.playStartupChime();
    
    systemIntegrity = 100;
    updateIntegrityDisplay();
    
    historyEl.innerHTML += `\n<span style="color:#008000; font-weight:bold;">[SUCCESS] You successfully escaped the subway underpass.\nSystem integrity restored to 100%.</span>\n`;
    historyEl.scrollTop = historyEl.scrollHeight;
  } else {
    historyEl.innerHTML += `\n` + et('exit8_forward').replace('{exit}', window.exit8Level) + `\n`;
    rollExit8Anomaly();
    historyEl.scrollTop = historyEl.scrollHeight;
  }
}

/* Backrooms point-of-no-return ending adventure */
function triggerBackroomsEnding() {
  bossActive = true; 
  window.terminalState = null;
  
  document.querySelectorAll('.window').forEach(w => w.remove());
  
  if (window.stopTinnitusBeep) window.stopTinnitusBeep();
  if (window.muteAmbientDrone) window.muteAmbientDrone(true);
  if (window.stopGhostlyBreathing) window.stopGhostlyBreathing();
  
  if (window.startBackroomsHum) window.startBackroomsHum();
  
  const screen = document.getElementById('backrooms-screen');
  if (screen) screen.style.display = 'flex';
  
  window.backroomsSteps = 0;
  window.backroomsThreat = 0;
  
  const hist = document.getElementById('backrooms-history');
  if (hist) {
    hist.innerHTML = et('backrooms_welcome');
    hist.scrollTop = hist.scrollHeight;
  }
  
  const input = document.getElementById('backrooms-input');
  if (input) {
    input.focus();
    // Auto focus lock
    input.addEventListener('blur', () => {
      setTimeout(() => input.focus(), 50);
    });
  }
}

function handleBackroomsInput(val) {
  const cmd = val.toLowerCase().trim();
  const hist = document.getElementById('backrooms-history');
  if (!hist) return;
  
  hist.innerHTML += `\n> ${val}\n`;
  
  if (cmd === 'reset') {
    if (window.stopBackroomsHum) window.stopBackroomsHum();
    window.location.reload();
    return;
  }
  
  if (cmd === 'look') {
    hist.innerHTML += et('backrooms_look') + '\n';
  } else if (cmd === 'walk') {
    window.backroomsSteps++;
    if (window.playProceduralKick) window.playProceduralKick();
    
    hist.innerHTML += et('backrooms_walk').replace('{steps}', window.backroomsSteps) + '\n';
    
    if (Math.random() < 0.35) {
      const tear = document.getElementById('screen-tear');
      if (tear) {
        tear.classList.add('active');
        setTimeout(() => tear.classList.remove('active'), 90);
      }
    }
    
    if (Math.random() < 0.45) {
      window.backroomsThreat++;
    }
    
    if (window.backroomsThreat > 3) {
      triggerBackroomsJumpscare();
      return;
    }
  } else if (cmd === 'listen') {
    let noiseMsg = '';
    if (window.backroomsThreat <= 1) {
      noiseMsg = et('backrooms_noise_none');
    } else if (window.backroomsThreat === 2) {
      noiseMsg = et('backrooms_noise_distant');
      if (window.playGlitchNote) window.playGlitchNote(60, 0.8, false);
    } else {
      noiseMsg = et('backrooms_noise_close');
      if (window.playGlitchNote) window.playGlitchNote(90, 0.4, true);
    }
    hist.innerHTML += et('backrooms_listen').replace('{noise}', noiseMsg) + '\n';
  } else if (cmd === 'escape') {
    hist.innerHTML += et('backrooms_escape') + '\n';
    if (Math.random() < 0.3) {
      window.backroomsThreat++;
    }
    if (window.backroomsThreat > 3) {
      triggerBackroomsJumpscare();
      return;
    }
  } else {
    hist.innerHTML += `Bad command: '${cmd}'\n`;
  }
  
  hist.scrollTop = hist.scrollHeight;
  if (window.playTypingSound) window.playTypingSound('system');
}

function triggerBackroomsJumpscare() {
  const screamer = document.getElementById('screamer-overlay');
  if (screamer) {
    screamer.classList.add('active');
    const face = screamer.querySelector('.screamer-face');
    if (face) face.innerText = "⊂(✖益✖)⊃";
    const text = screamer.querySelector('.screamer-text');
    if (text) text.innerText = et('backrooms_screamer');
  }
  
  if (window.playJumpscareSound) window.playJumpscareSound();
  
  safeStorage.clear();
  
  setTimeout(() => {
    if (screamer) screamer.classList.remove('active');
    const screen = document.getElementById('backrooms-screen');
    if (screen) screen.style.display = 'none';
    if (window.stopBackroomsHum) window.stopBackroomsHum();
    triggerBSOD("Fatal Exception: 0x000F8 - Coordinate exception in Euclidean space. Backrooms entity proximity violation.", "backrooms");
  }, 2200);
}

// Bind Backrooms Key Listener
document.addEventListener('DOMContentLoaded', () => {
  const backroomsInput = document.getElementById('backrooms-input');
  if (backroomsInput) {
    backroomsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = backroomsInput.value;
        backroomsInput.value = '';
        if (val.trim() !== '') {
          handleBackroomsInput(val);
        }
      }
    });
  }
});

/* ==========================================================================
   SPOT THE DIFFERENCE MINI-GAME (puzzle.exe)
   ========================================================================== */

let puzzleLevel = 1;

function openSpotDifferenceGame() {
  puzzleLevel = 1;
  const icon = `<svg viewBox="0 0 24 24" fill="#008080"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>`;
  
  const html = getPuzzleHTML();
  openWindow('puzzle_win', t('puzzle_win_title'), icon, html);
  
  setTimeout(() => {
    const input = document.getElementById('puzzle-answer-input');
    if (input) {
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          submitPuzzleAnswer();
        }
      });
    }
  }, 120);
}

function getPuzzleHTML() {
  let leftArt = '';
  let rightArt = '';
  
  if (puzzleLevel === 1) {
    leftArt = " ^ _ ^ \n( O O )";
    rightArt = " ^ o ^ \n( O O )";
  } else if (puzzleLevel === 2) {
    leftArt = "[12:00]\n  \\    ";
    rightArt = "[12:00]\n  /    ";
  } else {
    // Level 3: Creepy text anomalies based on system health
    if (systemIntegrity <= 50) {
      leftArt = "SYSTEM OK\nSTABLE   ";
      rightArt = "I SEE YOU\nSTABLE   ";
    } else {
      leftArt = "I AM SAFE\nHERE     ";
      rightArt = "HE IS HERE\nHERE     ";
    }
  }
  
  return `
    <div class="puzzle-container" style="color: #000; font-family: var(--sys-font); display: flex; flex-direction: column; justify-content: space-between; height: 100%; box-sizing: border-box; padding: 12px;">
      <div style="font-size: 14px; color:#333; margin-bottom: 12px; line-height: 1.4;">
        ${t('puzzle_desc')}
      </div>
      <div style="font-weight: bold; font-size: 14px; color: #000080; margin-bottom: 12px;" id="puzzle-level-indicator">
        ${t('puzzle_level')}: ${puzzleLevel} / 3
      </div>
      
      <div style="display: flex; gap: 20px; justify-content: center; align-items: center; margin-bottom: 15px; font-family: var(--term-font); font-size: 16px; background: #e0e0e0; border: 1px solid #808080; padding: 10px; border-radius:4px; box-shadow: inset 1px 1px 2px #555; height: 135px;">
        <div style="text-align: center;">
          <div style="font-size: 11px; font-weight: bold; color: #555; margin-bottom: 5px;">ORIGINAL</div>
          <pre style="margin:0; background:#f0f0f0; padding:6px; border:1px solid #c0c0c0; text-align: left; line-height: 1.3; font-family: var(--term-font); font-size: 16px;" id="puzzle-art-left">${leftArt}</pre>
        </div>
        <div style="font-size: 18px; font-weight: bold; color: #888;">vs</div>
        <div style="text-align: center;">
          <div style="font-size: 11px; font-weight: bold; color: #555; margin-bottom: 5px;">CORRUPTED</div>
          <pre style="margin:0; background:#f0f0f0; padding:6px; border:1px solid #c0c0c0; text-align: left; line-height: 1.3; font-family: var(--term-font); font-size: 16px;" id="puzzle-art-right">${rightArt}</pre>
        </div>
      </div>
      
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
        <input type="text" id="puzzle-answer-input" style="width: 80px; text-align: center; font-size: 16px; padding: 4px; border: 1px solid #808080; font-family: var(--term-font);" maxlength="1" placeholder="?">
        <button class="win-btn" style="padding: 4px 20px;" onclick="submitPuzzleAnswer()">${t('puzzle_submit_btn')}</button>
      </div>
      
      <div id="puzzle-status" style="font-size: 14px; font-weight: bold; height: 22px; display: flex; align-items: center;"></div>
    </div>
  `;
}

window.submitPuzzleAnswer = function() {
  const inputEl = document.getElementById('puzzle-answer-input');
  const statusEl = document.getElementById('puzzle-status');
  if (!inputEl || !statusEl) return;
  
  const ans = inputEl.value.trim();
  inputEl.value = '';
  inputEl.focus();
  
  let target = '';
  if (puzzleLevel === 1) target = 'o';
  else if (puzzleLevel === 2) target = '/';
  else {
    if (systemIntegrity <= 50) {
      target = 'I'; // "SYSTEM OK" vs "I SEE YOU" -> difference is 'I'
    } else {
      target = 'H'; // "I AM SAFE" vs "HE IS HERE" -> difference is 'H'
    }
  }
  
  if (ans === target) {
    statusEl.style.color = '#008000';
    if (window.playPuzzleSuccessSound) playPuzzleSuccessSound();
    
    if (puzzleLevel === 3) {
      statusEl.innerText = t('puzzle_victory_msg');
      inputEl.disabled = true;
      const btn = document.querySelector('.puzzle-container button');
      if (btn) btn.disabled = true;
      
      systemIntegrity = Math.min(100, systemIntegrity + 25);
      updateIntegrityDisplay();
      
      setTimeout(() => {
        closeWindow('puzzle_win');
      }, 4500);
    } else {
      statusEl.innerText = t('puzzle_success_msg');
      puzzleLevel++;
      
      setTimeout(() => {
        const body = document.querySelector('#puzzle_win .window-body');
        if (body) {
          body.innerHTML = getPuzzleHTML();
          setTimeout(() => {
            const input = document.getElementById('puzzle-answer-input');
            if (input) {
              input.focus();
              input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') submitPuzzleAnswer();
              });
            }
          }, 120);
        }
      }, 1000);
    }
  } else {
    statusEl.style.color = '#aa0000';
    statusEl.innerText = currentLang === 'ko' ? "오답입니다! 다시 생각해보세요." : "Wrong character! Try again.";
    
    if (window.playPuzzleFailSound) playPuzzleFailSound();
    
    damageSystemIntegrity(5, "Fatal Exception: 0x000F8 - Spot Anomaly calibration mismatch.", "cause_generic");
  }
};

function playPuzzleSuccessSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25];
  notes.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    gain.gain.setValueAtTime(0.1, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.15);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.2);
  });
}

function playPuzzleFailSound() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(130, now);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.35);
}



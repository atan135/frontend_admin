" ========================================
" Vim Configuration for CentOS Development
" ========================================

" ========================================
" Basic Settings
" ========================================

" Enable file type detection
filetype on
filetype plugin on
filetype indent on

" Enable syntax highlighting
syntax on

" Set encoding
set encoding=utf-8
set fileencodings=utf-8,gbk,gb2312,big5

" Set line numbers
set number
set relativenumber

" Set cursor line
set cursorline

" Set tab settings
set tabstop=4
set shiftwidth=4
set expandtab
set smarttab
set autoindent
set smartindent

" Set text width
set textwidth=80
set colorcolumn=81

" Set search settings
set hlsearch
set incsearch
set ignorecase
set smartcase

" Set backup settings
set backup
set backupdir=~/.vim/backup//
set directory=~/.vim/swap//
set undodir=~/.vim/undo//

" Set history
set history=1000
set undolevels=1000

" Set wildmenu
set wildmenu
set wildmode=longest:full,full

" Set status line
set laststatus=2
set statusline=%F%m%r%h%w\ [FORMAT=%{&ff}]\ [TYPE=%Y]\ [POS=%l,%v][%p%%]\ [BUFFER=%n]\ %{strftime('%c')}

" Set ruler
set ruler

" Set showcmd
set showcmd

" Set showmatch
set showmatch

" Set mouse
set mouse=a

" Set clipboard
set clipboard=unnamedplus

" Set backspace
set backspace=indent,eol,start

" Set wrap
set wrap
set linebreak

" Set scrolloff
set scrolloff=5

" Set sidescrolloff
set sidescrolloff=5

" Set fold
set foldmethod=indent
set foldlevel=99

" Set complete
set completeopt=menu,menuone,preview

" Set timeout
set timeoutlen=500

" Set ttimeout
set ttimeoutlen=0

" ========================================
" Key Mappings
" ========================================

" Set leader key
let mapleader = ","

" Quick save
nmap <leader>w :w<CR>

" Quick quit
nmap <leader>q :q<CR>

" Quick save and quit
nmap <leader>x :wq<CR>

" Quick quit without save
nmap <leader>! :q!<CR>

" Clear search highlight
nmap <leader>h :nohlsearch<CR>

" Toggle line numbers
nmap <leader>n :set number!<CR>

" Toggle relative line numbers
nmap <leader>r :set relativenumber!<CR>

" Toggle paste mode
nmap <leader>p :set paste!<CR>

" Toggle wrap
nmap <leader>w :set wrap!<CR>

" Toggle list
nmap <leader>l :set list!<CR>

" Toggle fold
nmap <leader>f :set foldenable!<CR>

" Open new tab
nmap <leader>t :tabnew<CR>

" Close tab
nmap <leader>c :tabclose<CR>

" Next tab
nmap <leader>] :tabnext<CR>

" Previous tab
nmap <leader>[ :tabprev<CR>

" Split window
nmap <leader>s :split<CR>
nmap <leader>v :vsplit<CR>

" Close window
nmap <leader>d :close<CR>

" Move between windows
nmap <C-h> <C-w>h
nmap <C-j> <C-w>j
nmap <C-k> <C-w>k
nmap <C-l> <C-w>l

" Resize windows
nmap <C-Up> <C-w>+
nmap <C-Down> <C-w>-
nmap <C-Left> <C-w><
nmap <C-Right> <C-w>>

" Move to beginning/end of line
nmap <C-a> ^
nmap <C-e> $

" Move to beginning/end of file
nmap <C-Home> gg
nmap <C-End> G

" Select all
nmap <C-a> ggVG

" Copy to system clipboard
vmap <C-c> "+y
nmap <C-c> "+y

" Paste from system clipboard
nmap <C-v> "+p
imap <C-v> <Esc>"+pa

" Cut to system clipboard
vmap <C-x> "+d
nmap <C-x> "+d

" ========================================
" File Type Specific Settings
" ========================================

" Python
autocmd FileType python setlocal tabstop=4 shiftwidth=4 expandtab
autocmd FileType python setlocal textwidth=88
autocmd FileType python setlocal colorcolumn=89

" JavaScript
autocmd FileType javascript setlocal tabstop=2 shiftwidth=2 expandtab
autocmd FileType javascript setlocal textwidth=100
autocmd FileType javascript setlocal colorcolumn=101

" TypeScript
autocmd FileType typescript setlocal tabstop=2 shiftwidth=2 expandtab
autocmd FileType typescript setlocal textwidth=100
autocmd FileType typescript setlocal colorcolumn=101

" HTML
autocmd FileType html setlocal tabstop=2 shiftwidth=2 expandtab
autocmd FileType html setlocal textwidth=100
autocmd FileType html setlocal colorcolumn=101

" CSS
autocmd FileType css setlocal tabstop=2 shiftwidth=2 expandtab
autocmd FileType css setlocal textwidth=100
autocmd FileType css setlocal colorcolumn=101

" JSON
autocmd FileType json setlocal tabstop=2 shiftwidth=2 expandtab
autocmd FileType json setlocal textwidth=100
autocmd FileType json setlocal colorcolumn=101

" YAML
autocmd FileType yaml setlocal tabstop=2 shiftwidth=2 expandtab
autocmd FileType yaml setlocal textwidth=100
autocmd FileType yaml setlocal colorcolumn=101

" Markdown
autocmd FileType markdown setlocal tabstop=2 shiftwidth=2 expandtab
autocmd FileType markdown setlocal textwidth=80
autocmd FileType markdown setlocal colorcolumn=81

" Shell
autocmd FileType sh setlocal tabstop=4 shiftwidth=4 expandtab
autocmd FileType sh setlocal textwidth=80
autocmd FileType sh setlocal colorcolumn=81

" PHP
autocmd FileType php setlocal tabstop=4 shiftwidth=4 expandtab
autocmd FileType php setlocal textwidth=120
autocmd FileType php setlocal colorcolumn=121

" SQL
autocmd FileType sql setlocal tabstop=2 shiftwidth=2 expandtab
autocmd FileType sql setlocal textwidth=100
autocmd FileType sql setlocal colorcolumn=101

" ========================================
" Color Scheme
" ========================================

" Set color scheme
colorscheme desert

" Set background
set background=dark

" ========================================
" Plugins (if available)
" ========================================

" Enable pathogen if available
if filereadable(expand("~/.vim/autoload/pathogen.vim"))
    execute pathogen#infect()
endif

" Enable vim-plug if available
if filereadable(expand("~/.vim/autoload/plug.vim"))
    call plug#begin('~/.vim/plugged')
    
    " Add your plugins here
    " Plug 'plugin/name'
    
    call plug#end()
endif

" ========================================
" Advanced Settings
" ========================================

" Set list characters
set listchars=tab:>-,trail:-,extends:>,precedes:<

" Set formatoptions
set formatoptions=tcqrn1

" Set virtualedit
set virtualedit=onemore

" Set hidden
set hidden

" Set switchbuf
set switchbuf=useopen,usetab,newtab

" Set diffopt
set diffopt=filler,context:3

" Set spell
set spelllang=en_us

" Set updatetime
set updatetime=1000

" Set shortmess
set shortmess=atI

" Set lazyredraw
set lazyredraw

" Set ttyfast
set ttyfast

" ========================================
" Functions
" ========================================

" Function to toggle line numbers
function! ToggleLineNumbers()
    if &number
        set nonumber
        set norelativenumber
    else
        set number
        set relativenumber
    endif
endfunction

" Function to toggle paste mode
function! TogglePasteMode()
    if &paste
        set nopaste
        echo "Paste mode OFF"
    else
        set paste
        echo "Paste mode ON"
    endif
endfunction

" Function to toggle wrap
function! ToggleWrap()
    if &wrap
        set nowrap
        echo "Wrap OFF"
    else
        set wrap
        echo "Wrap ON"
    endif
endfunction

" ========================================
" Auto Commands
" ========================================

" Auto source vimrc when it's saved
autocmd! bufwritepost .vimrc source %

" Auto remove trailing whitespace
autocmd BufWritePre * :%s/\s\+$//e

" Auto create directories for backup
autocmd BufWritePre * :call s:MkNonExDir(expand('<afile>'), +expand('<afile>', 1))

function! s:MkNonExDir(file, buf)
    if empty(getbufvar(a:buf, '&buftype')) && a:file!~#'\v^\w+\:\/'
        let dir=fnamemodify(a:file, ':h')
        if !isdirectory(dir)
            call mkdir(dir, 'p')
        endif
    endif
endfunction

" ========================================
" End of Configuration
" ========================================

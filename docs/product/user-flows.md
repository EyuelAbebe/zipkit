# User Flows

## Flow 1: Extract Archive

### Scenario

User downloads `project-files.zip` and wants to extract it safely.

### Steps

1. User clicks ZipKit extension icon
2. Popup shows "Open Archive" button
3. User clicks "Open Archive"
4. File picker appears
5. User selects `project-files.zip`
6. New tab opens with archive workspace
7. **Archive inspection appears:**
   - File tree showing all entries
   - Archive summary (156 files, 45 MB compressed, 128 MB uncompressed)
   - Safety scan results (✅ No issues detected)
8. User clicks "Extract All"
9. Folder picker appears
10. User selects destination folder
11. Extraction progress shows (156 files, progress bar)
12. Completion message appears
13. User can open destination folder

### Safety Variant

If archive contains path traversal:

7. Safety scan shows **⚠️ Warning: Path traversal detected**
8. Details show dangerous entries: `../../etc/passwd`
9. User sees options: [Cancel] [Extract Anyway]
10. User clicks [Cancel] (smart choice)

## Flow 2: Create Archive

### Scenario

User wants to create `backup.tar.gz` from project folder.

### Steps

1. User clicks ZipKit extension icon
2. Popup shows "Create Archive" button
3. User clicks "Create Archive"
4. New tab opens with creation wizard
5. User clicks "Add Files" or "Add Folder"
6. File/folder picker appears
7. User selects project folder
8. File list shows selected files
9. User chooses format: TAR.GZ
10. User chooses compression level: Medium
11. User clicks "Create Archive"
12. File save dialog appears
13. User chooses name and location: `backup.tar.gz`
14. Creation progress shows
15. Completion message appears
16. Archive ready to use

## Flow 3: Inspect Before Extracting

### Scenario

User receives `submissions.zip` and wants to see contents before extracting.

### Steps

1. User opens archive in ZipKit
2. Archive workspace shows file tree
3. User expands folders to browse structure
4. User clicks on `README.txt`
5. Text preview appears in panel
6. User searches for `.exe` files
7. Search shows 2 executables
8. **Safety warning**: Executable files detected
9. User decides to extract only documents folder
10. User selects `/documents` in tree
11. User clicks "Extract Selected"
12. Only documents folder extracts

## Flow 4: High Expansion Detection

### Scenario

User opens suspicious `free-game.zip` (actually an archive bomb).

### Steps

1. User opens `free-game.zip`
2. Archive inspection loads
3. **Safety scan detects high expansion ratio**
4. **⚠️ Warning: Extreme expansion risk**
5. Details show:
   - Compressed: 1 MB
   - Uncompressed: 100 GB
   - Ratio: 100,000:1
6. Warning explains potential resource exhaustion
7. User sees [Cancel] [Extract Anyway]
8. User clicks [Cancel]
9. Archive is not extracted
10. User avoids system lockup

## Flow 5: Selective Extraction

### Scenario

User only needs specific files from large archive.

### Steps

1. User opens `source-code.tar.gz`
2. Archive shows 10,000+ files
3. User searches for `config`
4. Results show 15 config files
5. User selects 3 needed config files
6. User clicks "Extract Selected"
7. Only 3 files extract (fast, saves space)

## Flow 6: Cancel Long Operation

### Scenario

User starts extracting huge archive but needs to stop.

### Steps

1. User extracts large archive
2. Progress shows 10% complete
3. User realizes wrong destination
4. User clicks "Cancel"
5. Extraction stops
6. Partial files cleaned up (if configurable)
7. User can start over

## Flow 7: Browse Nested Archives

### Scenario

Archive contains other archives inside.

### Steps

1. User opens `release-package.zip`
2. File tree shows:
   - `/docs.pdf`
   - `/source.tar.gz` (nested archive)
   - `/binaries.zip` (nested archive)
3. **Safety note: Nested archives detected**
4. User clicks on `source.tar.gz`
5. Option to open nested archive
6. User chooses to extract outer archive first
7. Then manually inspects nested archives

## Flow 8: Check Archive Format

### Scenario

User has file with wrong extension.

### Steps

1. User opens `mystery.bin`
2. ZipKit detects file format automatically
3. Shows: "Detected ZIP archive"
4. User proceeds with normal inspection/extraction

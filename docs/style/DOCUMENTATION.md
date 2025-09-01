# 📝 Documentation Style Guide

## 🎯 **MyMeds Pharmacy Documentation Standards**

This guide ensures all documentation follows consistent formatting, structure, and writing standards.

---

## 📋 **Document Structure**

### **Standard Document Template**
```markdown
# 🎯 Document Title

## 🎯 **Brief Description**

One paragraph explaining what this document covers.

---

## 🚀 **Section 1: Main Content**

### **Subsection with Details**
Content goes here with proper formatting.

**Key Points:**
- Point 1
- Point 2
- Point 3

---

## 📚 **Additional Resources**

- **[Related Doc](link.md)** - Brief description
- **[Another Doc](link.md)** - Brief description

---

**📝 Last Updated**: Date  
**🔧 Version**: X.X.X  
**👥 Maintained By**: Team Name

### **Required Sections**
Every document must include:
1. **Title** with appropriate emoji
2. **Brief Description** section
3. **Main Content** with clear headings
4. **Additional Resources** section
5. **Footer** with metadata

---

## 🎨 **Formatting Standards**

### **Headers & Hierarchy**
```markdown
# 🎯 Main Title (H1)
## 🚀 Section Title (H2)
### **Subsection Title (H3)**
#### **Sub-subsection (H4)**
```

**Rules:**
- Use emojis for main sections (H1, H2)
- Use **bold** for subsections (H3, H4)
- Maintain consistent hierarchy
- Don't skip header levels

### **Text Formatting**
```markdown
**Bold Text** - For emphasis and key terms
*Italic Text* - For secondary emphasis
`Code Text` - For inline code, file names, commands
~~Strikethrough~~ - For deprecated information
```

### **Lists & Bullet Points**
```markdown
**Unordered Lists:**
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2

**Ordered Lists:**
1. First step
2. Second step
3. Third step

**Definition Lists:**
**Term 1**: Definition or explanation
**Term 2**: Definition or explanation
```

---

## 🔗 **Linking Standards**

### **Internal Links**
```markdown
[Document Title](relative/path/to/document.md)
[Section Name](../parent/document.md#section-name)
```

**Rules:**
- Use relative paths for internal links
- Link to specific sections when possible
- Use descriptive link text
- Verify links work before publishing

### **External Links**
```markdown
[External Resource](https://example.com)
[Download Link](https://example.com/file.pdf)
```

**Rules:**
- Include full URLs
- Add context for external resources
- Use HTTPS when available
- Test links regularly

---

## 💻 **Code & Technical Content**

### **Code Blocks**
```markdown
**JavaScript/TypeScript:**
```javascript
function example() {
  console.log("Hello World");
}
```

**Bash/Shell:**
```bash
npm install
npm run dev
```

**JSON:**
```json
{
  "name": "example",
  "version": "1.0.0"
}
```

**SQL:**
```sql
SELECT * FROM users WHERE active = true;
```
```

### **Inline Code**
```markdown
Use `npm install` to install dependencies.
The `package.json` file contains project configuration.
Run `npm run dev` to start development server.
```

### **File Paths**
```markdown
**Correct:**
- `src/components/Button.tsx`
- `backend/src/routes/users.ts`
- `docs/api/REFERENCE.md`

**Incorrect:**
- src/components/Button.tsx
- backend\src\routes\users.ts
```

---

## 📊 **Tables & Data**

### **Standard Table Format**
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

### **Table Guidelines**
- Align columns properly
- Use consistent formatting
- Include headers for all columns
- Keep tables readable on mobile
- Use appropriate column widths

### **Data Presentation**
```markdown
**Metrics:**
- **Response Time**: 200ms average
- **Uptime**: 99.9%
- **Users**: 1,000+ active

**Status Indicators:**
- ✅ **Complete** - Feature implemented
- 🚧 **In Progress** - Feature under development
- ❌ **Not Started** - Feature planned
- ⚠️ **Blocked** - Feature blocked by dependency
```

---

## 🖼️ **Images & Media**

### **Image Standards**
```markdown
![Alt Text](path/to/image.png "Optional Title")

**Screenshot of Admin Dashboard**
![Admin Dashboard](images/admin-dashboard.png "Admin Dashboard showing user statistics")
```

### **Image Guidelines**
- Use descriptive alt text
- Include optional titles for context
- Store images in appropriate directories
- Use appropriate image formats (PNG, JPG, SVG)
- Optimize images for web

---

## 🔍 **Search & Navigation**

### **Table of Contents**
```markdown
## 📋 **Table of Contents**

1. [Section 1](#section-1)
2. [Section 2](#section-2)
   - [Subsection 2.1](#subsection-21)
   - [Subsection 2.2](#subsection-22)
3. [Section 3](#section-3)
```

### **Navigation Elements**
```markdown
**Quick Navigation:**
- [🚀 Quick Start](#quick-start)
- [🔧 Setup](#setup)
- [📚 Documentation](#documentation)

**Related Documents:**
- **[Previous: Setup Guide](SETUP.md)** ←
- **[Next: API Reference](API.md)** →
```

---

## 📝 **Writing Style**

### **Tone & Voice**
- **Professional but friendly** - Technical but approachable
- **Clear and concise** - Avoid unnecessary jargon
- **Action-oriented** - Use active voice when possible
- **Consistent terminology** - Use the same terms throughout

### **Language Guidelines**
```markdown
**Good:**
- "Click the Save button to save your changes"
- "The system automatically validates input"
- "Users can create accounts through the registration form"

**Avoid:**
- "You will want to click the Save button"
- "The system will automatically validate input"
- "Users will be able to create accounts"
```

### **Technical Writing**
- Define acronyms on first use
- Use consistent terminology
- Provide examples for complex concepts
- Include step-by-step instructions
- Anticipate common questions

---

## 🚨 **Error & Warning Formatting**

### **Alert Boxes**
```markdown
> ⚠️ **Warning**: This action cannot be undone.

> 🚨 **Error**: Invalid configuration detected.

> 💡 **Tip**: Use keyboard shortcuts for faster navigation.

> 📚 **Note**: Additional information available in the reference guide.
```

### **Status Indicators**
```markdown
**Status:**
- ✅ **Working** - Feature functioning correctly
- ❌ **Broken** - Feature not working
- 🚧 **Fixing** - Feature being repaired
- 🔄 **Updating** - Feature being updated
```

---

## 📅 **Versioning & Updates**

### **Document Metadata**
```markdown
**📝 Last Updated**: December 2024  
**🔧 Version**: 2.0.0  
**👥 Maintained By**: MyMeds Development Team  
**📋 Review Cycle**: Quarterly
```

### **Change Tracking**
```markdown
## 📝 **Change Log**

### **Version 2.0.0** - December 2024
- ✅ Added new API endpoints
- 🔧 Updated authentication flow
- 📚 Improved documentation structure

### **Version 1.5.0** - November 2024
- 🚧 Fixed user registration bug
- 📱 Enhanced mobile responsiveness
```

---

## 🔍 **Quality Checklist**

### **Before Publishing**
- [ ] **Structure**: Follows standard template
- [ ] **Formatting**: Consistent with style guide
- [ ] **Links**: All internal/external links work
- [ ] **Code**: Code examples are correct and tested
- [ ] **Images**: Images are optimized and accessible
- [ ] **Grammar**: Content is proofread
- [ ] **Accuracy**: Information is current and correct

### **Content Review**
- [ ] **Clarity**: Easy to understand
- [ ] **Completeness**: Covers all necessary topics
- [ ] **Consistency**: Terminology and formatting consistent
- [ ] **Navigation**: Easy to find information
- [ ] **Searchability**: Content is discoverable

---

## 📚 **Documentation Types**

### **User Guides**
- **Purpose**: Help users accomplish tasks
- **Format**: Step-by-step instructions
- **Tone**: Friendly and supportive
- **Examples**: Screenshots and real scenarios

### **Technical Documentation**
- **Purpose**: Explain technical concepts
- **Format**: Detailed explanations with examples
- **Tone**: Professional and precise
- **Examples**: Code samples and diagrams

### **Reference Materials**
- **Purpose**: Quick lookup of information
- **Format**: Tables, lists, and concise explanations
- **Tone**: Direct and factual
- **Examples**: Minimal, focused on facts

---

## 🆘 **Getting Help**

### **Style Questions**
- **Formatting**: Check this style guide first
- **Structure**: Review similar documents
- **Content**: Ask the documentation team
- **Technical**: Consult subject matter experts

### **Review Process**
1. **Self-review** using this style guide
2. **Peer review** by team members
3. **Technical review** by subject experts
4. **Final review** by documentation lead

---

## 📖 **Additional Resources**

- **[Markdown Guide](https://www.markdownguide.org/)** - Markdown syntax reference
- **[Technical Writing](https://developers.google.com/tech-writing)** - Google's technical writing guide
- **[Documentation Best Practices](https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis)** - GitHub's documentation guide

---

**📝 Style Guide Version**: 1.0.0  
**🔧 Last Updated**: December 2024  
**👥 Maintained By**: MyMeds Documentation Team


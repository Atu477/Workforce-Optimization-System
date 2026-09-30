const Skill = require('../models/Skill');
const User = require('../models/User');

// Get all skills in catalog
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, name: 1 });
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching skills' });
  }
};

// Create new skill in catalog (Admin only)
exports.createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !category) {
      return res.status(400).json({ message: 'Skill name and category are required' });
    }

    const existing = await Skill.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.status(400).json({ message: 'Skill already exists in catalog' });
    }

    const newSkill = new Skill({ name, category, description: description || '' });
    await newSkill.save();

    res.status(201).json({ message: 'Skill added to catalog', skill: newSkill });
  } catch (err) {
    res.status(500).json({ message: 'Server error creating skill' });
  }
};

// Update existing skill in catalog (Admin only)
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Skill name and category are required' });
    }

    // Check for duplicate name (excluding current skill)
    const duplicate = await Skill.findOne({
      name: new RegExp(`^${name}$`, 'i'),
      _id: { $ne: id }
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Another skill with this name already exists' });
    }

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const oldName = skill.name;
    const oldCategory = skill.category;

    skill.name = name;
    skill.category = category;
    skill.description = description || '';
    await skill.save();

    // If name or category changed, update it in all employee profiles too
    if (oldName !== name || oldCategory !== category) {
      await User.updateMany(
        { 'skills.skillName': oldName },
        {
          $set: {
            'skills.$[elem].skillName': name,
            'skills.$[elem].category': category
          }
        },
        { arrayFilters: [{ 'elem.skillName': oldName }] }
      );
    }

    res.json({ message: 'Skill updated successfully', skill });
  } catch (err) {
    console.error('Error updating skill:', err);
    res.status(500).json({ message: 'Server error updating skill' });
  }
};

// Delete skill from catalog (Admin only)
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const skillName = skill.name;

    // Remove skill from all employee profiles that have it
    await User.updateMany(
      { 'skills.skillName': skillName },
      { $pull: { skills: { skillName: skillName } } }
    );

    await Skill.findByIdAndDelete(id);

    res.json({ message: `Skill "${skillName}" deleted from catalog and removed from all employee profiles` });
  } catch (err) {
    console.error('Error deleting skill:', err);
    res.status(500).json({ message: 'Server error deleting skill' });
  }
};

// Skill Matrix Search - Match employees by skill & proficiency
exports.getSkillMatrix = async (req, res) => {
  try {
    const { skillName, category, proficiency, department } = req.query;

    let query = { status: 'Active' };
    if (department) query.department = department;

    const employees = await User.find(query).select('-password');

    let resultMatrix = employees.map(emp => {
      const filteredSkills = (emp.skills || []).filter(s => {
        let match = true;
        if (skillName) {
          match = match && Boolean(s.skillName && s.skillName.toLowerCase().includes(skillName.toLowerCase()));
        }
        if (category) {
          match = match && Boolean(s.category && s.category.toLowerCase() === category.toLowerCase());
        }
        if (proficiency) {
          match = match && s.proficiency === proficiency;
        }
        return match;
      });

      return {
        _id: emp._id,
        employeeId: emp.employeeId,
        name: emp.name,
        department: emp.department,
        designation: emp.designation,
        shift: emp.shift,
        matchedSkills: filteredSkills,
        allSkills: emp.skills
      };
    });

    // If a specific skill query was provided, only return employees who have matching skills
    if (skillName || category || proficiency) {
      resultMatrix = resultMatrix.filter(emp => emp.matchedSkills.length > 0);
    }

    res.json(resultMatrix);
  } catch (err) {
    console.error('Error fetching skill matrix:', err);
    res.status(500).json({ message: 'Server error fetching skill matrix' });
  }
};

import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { careerAPI } from '../../api/careerAPI';
import { quizAPI } from '../../api/quizAPI';
import QuizModal from '../../components/QuizModal';

const CareerExplorer = () => {
  const [careerRoles, setCareerRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSkillForConfirm, setSelectedSkillForConfirm] = useState(null);
  const [completedSkills, setCompletedSkills] = useState([]);

  useEffect(() => {
    loadCareerRoles();
    loadCompletedSkills();
  }, []);

  const loadCareerRoles = async () => {
    try {
      setLoading(true);
      const data = await careerAPI.getCareerRoles();
      setCareerRoles(data);
    } catch (error) {
      console.error('Failed to load career roles:', error);
      setError('Failed to load career roles');
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedSkills = async () => {
    try {
      const data = await quizAPI.getCompletedSkills();
      setCompletedSkills(data.completed_skill_ids || []);
    } catch (error) {
      console.error('Failed to load completed skills:', error);
    }
  };

  const loadRoleDetails = async (roleId) => {
    try {
      const data = await careerAPI.getCareerRoleDetails(roleId);
      setSelectedRole(data);
    } catch (error) {
      console.error('Failed to load role details:', error);
      setError('Failed to load role details');
    }
  };

  const handleMarkAsCompleted = (skill) => {
    setSelectedSkillForConfirm(skill);
    setShowConfirmDialog(true);
  };

  const handleTakeTest = (skill) => {
    setSelectedSkill(skill);
    setShowQuizModal(true);
    setShowConfirmDialog(false);
    setSelectedSkillForConfirm(null);
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setSelectedSkillForConfirm(null);
  };

  const handleCloseQuiz = () => {
    setShowQuizModal(false);
    setSelectedSkill(null);
    loadCompletedSkills(); // Refresh completed skills after quiz
  };

  const isSkillCompleted = (skillId) => {
    return completedSkills.includes(skillId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading career roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <Button onClick={loadCareerRoles} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Career Explorer</h1>

      {!selectedRole ? (
        <div>
          <p className="text-gray-600 mb-6">
            Explore different career paths and test your skills for each role.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerRoles.map((role) => (
              <Card key={role._id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div onClick={() => loadRoleDetails(role._id)}>
                  <h3 className="text-xl font-semibold mb-2">{role.role_name}</h3>
                  <p className="text-gray-600 mb-3">{role.description}</p>
                  {role.avg_salary && (
                    <p className="text-green-600 font-medium">Avg Salary: {role.avg_salary}</p>
                  )}
                  <Button className="mt-4 w-full">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <Button
            onClick={() => setSelectedRole(null)}
            variant="secondary"
            className="mb-4"
          >
            ← Back to All Roles
          </Button>

          <Card>
            <h2 className="text-2xl font-bold mb-2">{selectedRole.role_name}</h2>
            <p className="text-gray-600 mb-4">{selectedRole.description}</p>
            {selectedRole.avg_salary && (
              <p className="text-green-600 font-medium mb-6">Average Salary: {selectedRole.avg_salary}</p>
            )}

            <h3 className="text-xl font-semibold mb-4">Required Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRole.skills.map((skill) => {
                const completed = isSkillCompleted(skill._id);
                return (
                  <div key={skill._id} className={`border rounded-lg p-4 ${completed ? 'bg-green-50 border-green-200' : ''}`}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{skill.skill_name}</h4>
                      <span className="text-sm text-gray-500">{skill.category}</span>
                    </div>
                    {completed ? (
                      <div className="text-center">
                        <div className="text-green-600 mb-1">✓</div>
                        <div className="text-green-800 font-medium">Skill Completed!</div>
                        <div className="text-sm text-green-600">You got this! 🎉</div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleMarkAsCompleted(skill)}
                        size="sm"
                        className="w-full"
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {showQuizModal && selectedSkill && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={handleCloseQuiz}
          skill={selectedSkill}
        />
      )}

      {showConfirmDialog && selectedSkillForConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Mark Skill as Completed</h3>
            <p className="text-gray-600 mb-6">
              You need to take the test to mark this skill as completed! Are you ready to take the test?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => handleTakeTest(selectedSkillForConfirm)}
                className="flex-1"
              >
                Take Test
              </Button>
              <Button
                onClick={handleCancelConfirm}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerExplorer;

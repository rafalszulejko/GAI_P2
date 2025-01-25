'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Database } from "@/utils/supabase/supabase";
import { createClient } from "@/utils/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

type Team = Database['public']['Tables']['team']['Row'];
type UserProfile = Database['public']['Tables']['user_profile']['Row'];

interface TeamMembersListProps {
  teams: Team[];
  users: UserProfile[];
  canEdit: boolean;
}

export function TeamMembersList({ teams, users, canEdit }: TeamMembersListProps) {
  const [selectedTeam, setSelectedTeam] = useState<Team>(teams[0]);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [selectedAvailable, setSelectedAvailable] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClient();

  // Load team members when team changes
  const loadTeamMembers = async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_member')
        .select('user_id')
        .eq('team_id', teamId);

      if (error) throw error;

      const memberIds = data.map(tm => tm.user_id);
      const teamMembers = users.filter(user => memberIds.includes(user.id));
      setTeamMembers(teamMembers);
    } catch (err) {
      console.error('Error loading team members:', err);
    }
  };

  // Handle team change
  const handleTeamChange = (team: Team) => {
    setSelectedTeam(team);
    setSelectedAvailable([]);
    setSelectedMembers([]);
    loadTeamMembers(team.id);
  };

  // Handle creating new team
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('team')
        .insert({ name: newTeamName.trim() })
        .select()
        .single();

      if (error) throw error;

      // Add the new team to the list and select it
      teams.push(data);
      setSelectedTeam(data);
      setNewTeamName('');
      setIsDialogOpen(false);
      loadTeamMembers(data.id);
    } catch (err) {
      console.error('Error creating team:', err);
    }
  };

  // Handle adding members
  const handleAddMembers = async () => {
    if (selectedAvailable.length === 0) return;

    try {
      const { error } = await supabase
        .from('team_member')
        .insert(
          selectedAvailable.map(userId => ({
            team_id: selectedTeam.id,
            user_id: userId
          }))
        );

      if (error) throw error;

      // Update local state
      const newMembers = users.filter(user => selectedAvailable.includes(user.id));
      setTeamMembers(prev => [...prev, ...newMembers]);
      setSelectedAvailable([]);
    } catch (err) {
      console.error('Error adding team members:', err);
    }
  };

  // Handle removing members
  const handleRemoveMembers = async () => {
    if (selectedMembers.length === 0) return;

    try {
      const { error } = await supabase
        .from('team_member')
        .delete()
        .eq('team_id', selectedTeam.id)
        .in('user_id', selectedMembers);

      if (error) throw error;

      // Update local state
      setTeamMembers(prev => 
        prev.filter(member => !selectedMembers.includes(member.id))
      );
      setSelectedMembers([]);
    } catch (err) {
      console.error('Error removing team members:', err);
    }
  };

  // Toggle selection in available list
  const toggleAvailable = (userId: string) => {
    if (!canEdit) return;
    setSelectedAvailable(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle selection in members list
  const toggleMember = (userId: string) => {
    if (!canEdit) return;
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Get available users (not in team)
  const availableUsers = users
    .filter(user => !teamMembers.some(member => member.id === user.id))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  // Sort team members
  const sortedTeamMembers = [...teamMembers].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-4">
          <Select
            value={selectedTeam?.id}
            onValueChange={(id) => handleTeamChange(teams.find(t => t.id === id)!)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a team">
                {selectedTeam?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {canEdit && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  New Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Team Name</Label>
                    <Input
                      id="name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="Enter team name"
                    />
                  </div>
                  <Button onClick={handleCreateTeam} className="w-full">
                    Create Team
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-4">
          {/* Available users */}
          <div className="border rounded-lg p-2 space-y-1">
            {availableUsers.map(user => (
              <div
                key={user.id}
                className={`p-2 rounded ${canEdit ? 'cursor-pointer' : ''} ${
                  selectedAvailable.includes(user.id)
                    ? 'bg-primary text-primary-foreground'
                    : canEdit ? 'hover:bg-secondary' : ''
                }`}
                onClick={() => toggleAvailable(user.id)}
              >
                {user.name || user.email}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleAddMembers}
              disabled={!canEdit || selectedAvailable.length === 0}
            >
              →
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRemoveMembers}
              disabled={!canEdit || selectedMembers.length === 0}
            >
              ←
            </Button>
          </div>

          {/* Team members */}
          <div className="border rounded-lg p-2 space-y-1">
            {sortedTeamMembers.map(user => (
              <div
                key={user.id}
                className={`p-2 rounded ${canEdit ? 'cursor-pointer' : ''} ${
                  selectedMembers.includes(user.id)
                    ? 'bg-primary text-primary-foreground'
                    : canEdit ? 'hover:bg-secondary' : ''
                }`}
                onClick={() => toggleMember(user.id)}
              >
                {user.name || user.email}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 